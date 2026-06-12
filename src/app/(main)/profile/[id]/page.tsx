import ProfileClient from './ProfileClient';

export function generateStaticParams() {
  return [{ id: 'demo' }];
}

export default function ProfilePage() {
  return <ProfileClient />;
}
