-- Space Social Media Platform - Supabase Schema
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "moddatetime";

-- ============================================
-- PROFILES
-- ============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text not null,
  bio text default '',
  avatar_url text,
  cover_url text,
  website text default '',
  location text default '',
  role text default 'user' check (role in ('user', 'admin', 'moderator')),
  verified boolean default false,
  is_banned boolean default false,
  ban_reason text,
  follower_count int default 0,
  following_count int default 0,
  post_count int default 0,
  voice_comment_count int default 0,
  admin_portal_activated boolean default false,
  admin_password_hash text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- POSTS
-- ============================================
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text,
  media_urls text[] default '{}',
  media_type text check (media_type in ('image', 'video', 'none')),
  post_type text default 'text' check (post_type in ('text', 'poll', 'voice', 'shared')),
  poll_options jsonb,
  poll_ends_at timestamptz,
  like_count int default 0,
  repost_count int default 0,
  comment_count int default 0,
  voice_comment_count int default 0,
  bookmark_count int default 0,
  is_pinned boolean default false,
  is_flagged boolean default false,
  flag_reason text,
  repost_of uuid references public.posts(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- VOICE COMMENTS
-- ============================================
create table public.voice_comments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  parent_id uuid references public.voice_comments(id) on delete cascade,
  audio_url text not null,
  duration int not null, -- seconds
  transcript text,
  waveform_data jsonb,
  like_count int default 0,
  reply_count int default 0,
  is_flagged boolean default false,
  created_at timestamptz default now()
);

-- ============================================
-- COMMENTS (text)
-- ============================================
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  parent_id uuid references public.comments(id) on delete cascade,
  content text not null,
  like_count int default 0,
  created_at timestamptz default now()
);

-- ============================================
-- FOLLOWS
-- ============================================
create table public.follows (
  follower_id uuid references public.profiles(id) on delete cascade,
  following_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id)
);

-- ============================================
-- LIKES
-- ============================================
create table public.likes (
  user_id uuid references public.profiles(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, post_id)
);

-- ============================================
-- VOICE COMMENT LIKES
-- ============================================
create table public.voice_comment_likes (
  user_id uuid references public.profiles(id) on delete cascade,
  voice_comment_id uuid references public.voice_comments(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, voice_comment_id)
);

-- ============================================
-- BOOKMARKS
-- ============================================
create table public.bookmarks (
  user_id uuid references public.profiles(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, post_id)
);

-- ============================================
-- NOTIFICATIONS
-- ============================================
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  actor_id uuid references public.profiles(id) on delete cascade,
  type text not null check (type in ('like', 'follow', 'comment', 'voice_comment', 'mention', 'repost', 'admin')),
  post_id uuid references public.posts(id) on delete cascade,
  voice_comment_id uuid references public.voice_comments(id) on delete cascade,
  content text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ============================================
-- POLLS (votes)
-- ============================================
create table public.poll_votes (
  user_id uuid references public.profiles(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  option_index int not null,
  created_at timestamptz default now(),
  primary key (user_id, post_id)
);

-- ============================================
-- REPORTS
-- ============================================
create table public.reports (
  id uuid default uuid_generate_v4() primary key,
  reporter_id uuid references public.profiles(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  voice_comment_id uuid references public.voice_comments(id) on delete cascade,
  reason text not null,
  details text,
  status text default 'pending' check (status in ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  resolved_at timestamptz
);

-- ============================================
-- ADMIN LOGS
-- ============================================
create table public.admin_logs (
  id uuid default uuid_generate_v4() primary key,
  admin_id uuid references public.profiles(id) on delete cascade not null,
  action text not null,
  target_type text,
  target_id uuid,
  details jsonb,
  ip_address text,
  created_at timestamptz default now()
);

-- ============================================
-- PLATFORM SETTINGS
-- ============================================
create table public.platform_settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz default now()
);

-- ============================================
-- INDEXES
-- ============================================
create index idx_posts_user_id on public.posts(user_id);
create index idx_posts_created_at on public.posts(created_at desc);
create index idx_posts_post_type on public.posts(post_type);
create index idx_voice_comments_post_id on public.voice_comments(post_id);
create index idx_voice_comments_user_id on public.voice_comments(user_id);
create index idx_comments_post_id on public.comments(post_id);
create index idx_follows_follower on public.follows(follower_id);
create index idx_follows_following on public.follows(following_id);
create index idx_notifications_user_id on public.notifications(user_id);
create index idx_notifications_created_at on public.notifications(created_at desc);
create index idx_notifications_is_read on public.notifications(is_read);
create index idx_likes_post_id on public.likes(post_id);
create index idx_bookmarks_user_id on public.bookmarks(user_id);
create index idx_reports_status on public.reports(status);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update follower/following counts
create or replace function update_follow_counts()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update profiles set follower_count = follower_count + 1 where id = new.following_id;
    update profiles set following_count = following_count + 1 where id = new.follower_id;
    return new;
  elsif tg_op = 'DELETE' then
    update profiles set follower_count = follower_count - 1 where id = old.following_id;
    update profiles set following_count = following_count - 1 where id = old.follower_id;
    return old;
  end if;
end;
$$ language plpgsql security definer;

create trigger on_follow_change
  after insert or delete on follows
  for each row execute function update_follow_counts();

-- Auto-update like counts
create or replace function update_like_counts()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update posts set like_count = like_count + 1 where id = new.post_id;
    return new;
  elsif tg_op = 'DELETE' then
    update posts set like_count = like_count - 1 where id = old.post_id;
    return old;
  end if;
end;
$$ language plpgsql security definer;

create trigger on_like_change
  after insert or delete on likes
  for each row execute function update_like_counts();

-- Auto-update post comment counts
create or replace function update_post_comment_counts()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update posts set comment_count = comment_count + 1 where id = new.post_id;
    return new;
  elsif tg_op = 'DELETE' then
    update posts set comment_count = comment_count - 1 where id = old.post_id;
    return old;
  end if;
end;
$$ language plpgsql security definer;

create trigger on_comment_change
  after insert or delete on comments
  for each row execute function update_post_comment_counts();

-- Auto-update voice comment counts
create or replace function update_voice_comment_counts()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update posts set voice_comment_count = voice_comment_count + 1 where id = new.post_id;
    update profiles set voice_comment_count = voice_comment_count + 1 where id = new.user_id;
    return new;
  elsif tg_op = 'DELETE' then
    update posts set voice_comment_count = voice_comment_count - 1 where id = old.post_id;
    update profiles set voice_comment_count = voice_comment_count - 1 where id = old.user_id;
    return old;
  end if;
end;
$$ language plpgsql security definer;

create trigger on_voice_comment_change
  after insert or delete on voice_comments
  for each row execute function update_voice_comment_counts();

-- Auto-update bookmark counts
create or replace function update_bookmark_counts()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update posts set bookmark_count = bookmark_count + 1 where id = new.post_id;
    return new;
  elsif tg_op = 'DELETE' then
    update posts set bookmark_count = bookmark_count - 1 where id = old.post_id;
    return old;
  end if;
end;
$$ language plpgsql security definer;

create trigger on_bookmark_change
  after insert or delete on bookmarks
  for each row execute function update_bookmark_counts();

-- Auto-update post counts
create or replace function update_post_counts()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update profiles set post_count = post_count + 1 where id = new.user_id;
    return new;
  elsif tg_op = 'DELETE' then
    update profiles set post_count = post_count - 1 where id = old.user_id;
    return old;
  end if;
end;
$$ language plpgsql security definer;

create trigger on_post_change
  after insert or delete on posts
  for each row execute function update_post_counts();

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on profiles
  for each row execute function update_updated_at();
create trigger posts_updated_at before update on posts
  for each row execute function update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.voice_comments enable row level security;
alter table public.comments enable row level security;
alter table public.follows enable row level security;
alter table public.likes enable row level security;
alter table public.voice_comment_likes enable row level security;
alter table public.bookmarks enable row level security;
alter table public.notifications enable row level security;
alter table public.poll_votes enable row level security;
alter table public.reports enable row level security;
alter table public.admin_logs enable row level security;
alter table public.platform_settings enable row level security;

-- Profiles: public read, owner write
create policy "Public profiles" on profiles for select using (true);
create policy "Update own profile" on profiles for update using (auth.uid() = id);
create policy "Insert own profile" on profiles for insert with check (auth.uid() = id);

-- Posts: public read, owner write/delete
create policy "Public posts" on posts for select using (true);
create policy "Create posts" on posts for insert with check (auth.uid() = user_id);
create policy "Update own posts" on posts for update using (auth.uid() = user_id);
create policy "Delete own posts" on posts for delete using (auth.uid() = user_id);

-- Voice comments: public read, owner write
create policy "Public voice comments" on voice_comments for select using (true);
create policy "Create voice comments" on voice_comments for insert with check (auth.uid() = user_id);
create policy "Delete own voice comments" on voice_comments for delete using (auth.uid() = user_id);

-- Comments: public read, owner write
create policy "Public comments" on comments for select using (true);
create policy "Create comments" on comments for insert with check (auth.uid() = user_id);
create policy "Delete own comments" on comments for delete using (auth.uid() = user_id);

-- Follows
create policy "Public follows" on follows for select using (true);
create policy "Follow" on follows for insert with check (auth.uid() = follower_id);
create policy "Unfollow" on follows for delete using (auth.uid() = follower_id);

-- Likes
create policy "Public likes" on likes for select using (true);
create policy "Like" on likes for insert with check (auth.uid() = user_id);
create policy "Unlike" on likes for delete using (auth.uid() = user_id);

-- Voice comment likes
create policy "Public voice comment likes" on voice_comment_likes for select using (true);
create policy "Like voice comment" on voice_comment_likes for insert with check (auth.uid() = user_id);
create policy "Unlike voice comment" on voice_comment_likes for delete using (auth.uid() = user_id);

-- Bookmarks
create policy "Own bookmarks" on bookmarks for select using (auth.uid() = user_id);
create policy "Bookmark" on bookmarks for insert with check (auth.uid() = user_id);
create policy "Unbookmark" on bookmarks for delete using (auth.uid() = user_id);

-- Notifications
create policy "Own notifications" on notifications for select using (auth.uid() = user_id);
create policy "Create notifications" on notifications for insert with check (true);
create policy "Update own notifications" on notifications for update using (auth.uid() = user_id);

-- Poll votes
create policy "Public poll votes" on poll_votes for select using (true);
create policy "Vote" on poll_votes for insert with check (auth.uid() = user_id);

-- Reports
create policy "Create reports" on reports for insert with check (auth.uid() = reporter_id);
create policy "Admin view reports" on reports for select using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'moderator'))
);

-- Admin logs
create policy "Admin only logs" on admin_logs for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Platform settings
create policy "Public read settings" on platform_settings for select using (true);
create policy "Admin write settings" on platform_settings for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- ============================================
-- REALTIME
-- ============================================
alter publication supabase_realtime add table notifications;
alter publication supabase_realtime add table posts;

-- ============================================
-- STORAGE BUCKETS
-- ============================================
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
insert into storage.buckets (id, name, public) values ('covers', 'covers', true);
insert into storage.buckets (id, name, public) values ('media', 'media', true);
insert into storage.buckets (id, name, public) values ('voice', 'voice', true);

-- Storage policies
create policy "Avatar upload" on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Avatar public" on storage.objects for select using (bucket_id = 'avatars');
create policy "Cover upload" on storage.objects for insert with check (bucket_id = 'covers' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Cover public" on storage.objects for select using (bucket_id = 'covers');
create policy "Media upload" on storage.objects for insert with check (bucket_id = 'media' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Media public" on storage.objects for select using (bucket_id = 'media');
create policy "Voice upload" on storage.objects for insert with check (bucket_id = 'voice' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Voice public" on storage.objects for select using (bucket_id = 'voice');
