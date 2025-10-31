import { notFound } from 'next/navigation';
import { PublicProfileClient } from './PublicProfileClient';

interface User {
  id: string;
  name?: string;
  username?: string;
  bio?: string;
  avatar_url?: string;
  city?: string;
  state?: string;
  country?: string;
  paths?: string[];
  skills?: string[];
  can_offer?: string;
  seeking_help?: string;
  created_at?: string;
}

async function getPublicProfile(username: string): Promise<User | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/profile/${username}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Failed to fetch public profile:', error);
    return null;
  }
}

export default async function PublicProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const user = await getPublicProfile(params.username);

  if (!user) {
    notFound();
  }

  return <PublicProfileClient user={user} />;
}
