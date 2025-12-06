'use client';

import { useRouter } from 'next/navigation';
import { Card, Button, Badge, Avatar, Label } from '@/components/ui';

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
  social_links?: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
    mastodon?: string;
    bluesky?: string;
  };
  created_at?: string;
}

const COOPERATION_PATHS = [
  { id: 'education', name: 'Collaborative Education', emoji: '📚' },
  { id: 'economy', name: 'Social Economy', emoji: '💰' },
  { id: 'wellbeing', name: 'Common Wellbeing', emoji: '🫶' },
  { id: 'technology', name: 'Cooperative Technology', emoji: '💻' },
  { id: 'governance', name: 'Collective Governance', emoji: '🏛️' },
  { id: 'community', name: 'Community Connection', emoji: '🤝' },
  { id: 'media', name: 'Collaborative Media', emoji: '🎨' },
  { id: 'planet', name: 'Common Planet', emoji: '🌍' },
];

export function PublicProfileClient({ user }: { user: User }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-bg-0">
      <header className="bg-white dark:bg-gray-800 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-ink-900">
              {user.name || user.username || 'Member Profile'}
            </h1>
            <Button variant="secondary" onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8">
          {user.avatar_url && (
            <div className="flex justify-center mb-6">
              <Avatar src={user.avatar_url} alt={user.name || 'User'} size="xl" />
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-ink-900 mb-4">About</h2>
              <div className="space-y-3">
                {user.name && (
                  <div>
                    <Label className="text-ink-700">Name</Label>
                    <p className="text-ink-900">{user.name}</p>
                  </div>
                )}
                {user.username && (
                  <div>
                    <Label className="text-ink-700">Username</Label>
                    <p className="text-ink-900">@{user.username}</p>
                  </div>
                )}
                {user.bio && (
                  <div>
                    <Label className="text-ink-700">Bio</Label>
                    <p className="text-ink-900">{user.bio}</p>
                  </div>
                )}
              </div>
            </div>

            {(user.city || user.state || user.country) && (
              <div>
                <h2 className="text-xl font-semibold text-ink-900 mb-4">Location</h2>
                <p className="text-ink-900">
                  {[user.city, user.state, user.country].filter(Boolean).join(', ')}
                </p>
              </div>
            )}

            {user.paths && user.paths.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-ink-900 mb-4">Cooperation Paths</h2>
                <div className="flex flex-wrap gap-2">
                  {COOPERATION_PATHS.filter((p) => user.paths?.includes(p.id)).map((path) => (
                    <Badge key={path.id} variant="brand">
                      {path.emoji} {path.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {user.skills && user.skills.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-ink-900 mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, i) => (
                    <Badge key={i} variant="default">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {user.can_offer && (
              <div>
                <h2 className="text-xl font-semibold text-ink-900 mb-4">What I Can Offer</h2>
                <p className="text-ink-900">{user.can_offer}</p>
              </div>
            )}

            {user.seeking_help && (
              <div>
                <h2 className="text-xl font-semibold text-ink-900 mb-4">What I'm Seeking</h2>
                <p className="text-ink-900">{user.seeking_help}</p>
              </div>
            )}

            {user.social_links && Object.values(user.social_links).some(v => v) && (
              <div>
                <h2 className="text-xl font-semibold text-ink-900 mb-4">Connect</h2>
                <div className="flex flex-wrap gap-3">
                  {user.social_links.github && (
                    <a
                      href={`https://github.com/${user.social_links.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 bg-bg-1 hover:bg-bg-2 rounded-md text-sm text-ink-900 transition-colors"
                    >
                      <span>GitHub</span>
                    </a>
                  )}
                  {user.social_links.twitter && (
                    <a
                      href={`https://twitter.com/${user.social_links.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 bg-bg-1 hover:bg-bg-2 rounded-md text-sm text-ink-900 transition-colors"
                    >
                      <span>Twitter</span>
                    </a>
                  )}
                  {user.social_links.linkedin && (
                    <a
                      href={`https://linkedin.com/in/${user.social_links.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 bg-bg-1 hover:bg-bg-2 rounded-md text-sm text-ink-900 transition-colors"
                    >
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {user.social_links.mastodon && (
                    <a
                      href={user.social_links.mastodon.startsWith('http') ? user.social_links.mastodon : `https://mastodon.social/@${user.social_links.mastodon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 bg-bg-1 hover:bg-bg-2 rounded-md text-sm text-ink-900 transition-colors"
                    >
                      <span>Mastodon</span>
                    </a>
                  )}
                  {user.social_links.bluesky && (
                    <a
                      href={`https://bsky.app/profile/${user.social_links.bluesky}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 bg-bg-1 hover:bg-bg-2 rounded-md text-sm text-ink-900 transition-colors"
                    >
                      <span>Bluesky</span>
                    </a>
                  )}
                  {user.social_links.website && (
                    <a
                      href={user.social_links.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 bg-bg-1 hover:bg-bg-2 rounded-md text-sm text-ink-900 transition-colors"
                    >
                      <span>Website</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {user.created_at && (
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-ink-700">
                  Member since {new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </p>
              </div>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
