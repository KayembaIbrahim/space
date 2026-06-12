-- ============================================
-- VERIFICATION BADGE SYSTEM
-- Migration: Add multi-tier verification badges
-- ============================================

-- Badge types:
--   'blue'      = Individual verified (paid subscription or admin-issued)
--   'grey'      = Government / official state accounts
--   'gold'      = Company / organization accounts
--   'blue_org'  = Associate of a gold company (company-issued blue tick)

-- ============================================
-- ALTER PROFILES: Add badge columns
-- ============================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS badge_type text default null
    check (badge_type in ('blue', 'grey', 'gold', 'blue_org')),
  ADD COLUMN IF NOT EXISTS badge_label text default null,
  ADD COLUMN IF NOT EXISTS badge_issued_by uuid references public.profiles(id) default null,
  ADD COLUMN IF NOT EXISTS badge_issued_at timestamptz default null,
  ADD COLUMN IF NOT EXISTS badge_expires_at timestamptz default null,
  ADD COLUMN IF NOT EXISTS badge_metadata jsonb default null;

-- ============================================
-- BADGE REQUESTS: Users apply for verification
-- ============================================
CREATE TABLE IF NOT EXISTS public.badge_requests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  requested_type text not null check (requested_type in ('blue', 'grey', 'gold')),
  display_label text,
  evidence_url text,
  evidence_text text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected', 'expired')),
  reviewed_by uuid references public.profiles(id),
  review_notes text,
  created_at timestamptz default now(),
  resolved_at timestamptz
);

-- ============================================
-- COMPANIES: Gold badge organizations
-- ============================================
CREATE TABLE IF NOT EXISTS public.companies (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  company_name text not null,
  industry text default '',
  website text default '',
  logo_url text default '',
  is_verified boolean default false,
  max_associates int default 50,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- COMPANY ASSOCIATES: Users linked to a company
-- ============================================
CREATE TABLE IF NOT EXISTS public.company_associates (
  id uuid default uuid_generate_v4() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'member' check (role in ('member', 'admin', 'executive')),
  title text default '',
  is_active boolean default true,
  added_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  unique(company_id, user_id)
);

-- ============================================
-- BADGE SUBSCRIPTIONS: For future crypto/payments
-- ============================================
CREATE TABLE IF NOT EXISTS public.badge_subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  badge_type text not null check (badge_type in ('blue', 'gold')),
  status text default 'active' check (status in ('active', 'expired', 'cancelled')),
  amount_paid numeric(10,2) default 0,
  currency text default 'USD',
  payment_method text default 'card',
  payment_reference text,
  starts_at timestamptz default now(),
  expires_at timestamptz,
  auto_renew boolean default false,
  created_at timestamptz default now()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_badge_requests_user ON public.badge_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_badge_requests_status ON public.badge_requests(status);
CREATE INDEX IF NOT EXISTS idx_companies_profile ON public.companies(profile_id);
CREATE INDEX IF NOT EXISTS idx_company_associates_company ON public.company_associates(company_id);
CREATE INDEX IF NOT EXISTS idx_company_associates_user ON public.company_associates(user_id);
CREATE INDEX IF NOT EXISTS idx_badge_subscriptions_user ON public.badge_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_badge ON public.profiles(badge_type);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.badge_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_associates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_subscriptions ENABLE ROW LEVEL SECURITY;

-- Badge requests: own read, admin write
CREATE POLICY "Own badge requests" ON badge_requests FOR SELECT
  USING (auth.uid() = user_id OR exists (
    select 1 from profiles where id = auth.uid() and role in ('admin', 'moderator')
  ));
CREATE POLICY "Submit badge request" ON badge_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin review badge requests" ON badge_requests FOR UPDATE
  USING (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Companies: public read, owner/admin write
CREATE POLICY "Public companies" ON companies FOR SELECT USING (true);
CREATE POLICY "Company owner update" ON companies FOR UPDATE
  USING (auth.uid() = profile_id);
CREATE POLICY "Create company" ON companies FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

-- Company associates: company admins manage
CREATE POLICY "View associates" ON company_associates FOR SELECT USING (true);
CREATE POLICY "Add associate" ON company_associates FOR INSERT
  WITH CHECK (
    exists (select 1 from company_associates ca
            join companies c on c.id = ca.company_id
            where ca.user_id = auth.uid() and ca.role in ('admin', 'executive') and c.id = company_id)
    OR exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
CREATE POLICY "Remove associate" ON company_associates FOR DELETE
  USING (
    exists (select 1 from company_associates ca
            join companies c on c.id = ca.company_id
            where ca.user_id = auth.uid() and ca.role in ('admin', 'executive') and c.id = company_id)
    OR exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Badge subscriptions: own read
CREATE POLICY "Own subscriptions" ON badge_subscriptions FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Create subscription" ON badge_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FUNCTION: Apply badge to user profile
-- ============================================
CREATE OR REPLACE FUNCTION apply_badge_to_profile(
  p_user_id uuid,
  p_badge_type text,
  p_label text default null,
  p_issued_by uuid default null,
  p_expires_at timestamptz default null,
  p_metadata jsonb default null
)
returns void as $$
begin
  UPDATE profiles SET
    badge_type = p_badge_type,
    badge_label = p_label,
    badge_issued_by = p_issued_by,
    badge_issued_at = now(),
    badge_expires_at = p_expires_at,
    badge_metadata = p_metadata
  WHERE id = p_user_id;
end;
$$ language plpgsql security definer;

-- ============================================
-- FUNCTION: Revoke badge from user
-- ============================================
CREATE OR REPLACE FUNCTION revoke_badge_from_profile(
  p_user_id uuid
)
returns void as $$
begin
  UPDATE profiles SET
    badge_type = null,
    badge_label = null,
    badge_issued_by = null,
    badge_issued_at = null,
    badge_expires_at = null,
    badge_metadata = null
  WHERE id = p_user_id;
end;
$$ language plpgsql security definer;

-- ============================================
-- FUNCTION: Issue company associate blue tick
-- ============================================
CREATE OR REPLACE FUNCTION issue_associate_badge(
  p_company_id uuid,
  p_user_id uuid,
  p_title text default '',
  p_added_by uuid default null
)
returns void as $$
declare
  v_company_name text;
begin
  -- Get company name for label
  SELECT company_name INTO v_company_name FROM companies WHERE id = p_company_id;

  -- Add to associates
  INSERT INTO company_associates (company_id, user_id, role, title, added_by)
  VALUES (p_company_id, p_user_id, 'member', p_title, p_added_by)
  ON CONFLICT (company_id, user_id) DO UPDATE SET
    is_active = true, title = p_title;

  -- Apply blue_org badge with company reference
  PERFORM apply_badge_to_profile(
    p_user_id,
    'blue_org',
    v_company_name,
    p_added_by,
    null,
    jsonb_build_object('company_id', p_company_id, 'company_name', v_company_name)
  );
end;
$$ language plpgsql security definer;

-- ============================================
-- TRIGGER: Auto-set companies.updated_at
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'companies_updated_at'
  ) THEN
    CREATE TRIGGER companies_updated_at BEFORE UPDATE ON companies
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;
