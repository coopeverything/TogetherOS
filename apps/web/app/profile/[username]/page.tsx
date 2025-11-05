import { notFound } from 'next/navigation';
import { PublicProfileClient } from './PublicProfileClient';
import { findUserByUsername } from '@/lib/db/users';

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
    // Use direct database access instead of HTTP fetch (Server Component pattern)
    const user = await findUserByUsername(username, true);

    if (!user) {
      return null;
    }

    // Return only public profile fields
    return {
      id: user.id,
      name: user.name,
      username: user.username,
      bio: user.bio,
      avatar_url: user.avatar_url,
      city: user.city,
      state: user.state,
      country: user.country,
      paths: user.paths,
      skills: user.skills,
      can_offer: user.can_offer,
      seeking_help: user.seeking_help,
      created_at: user.created_at?.toISOString(),
    };
  } catch (error) {
    console.error('Failed to fetch public profile:', error);
    return null;
  }
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await getPublicProfile(username);

  if (!user) {
    notFound();
  }

  return <PublicProfileClient user={user} />;
}
