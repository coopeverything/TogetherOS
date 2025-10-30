'use client';

import { useRouter } from 'next/navigation';
import { Card, Button, Badge, Avatar } from '@/components/ui';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  email: string;
  name?: string;
  bio?: string;
  avatar_url?: string;
  paths?: string[];
  skills?: string[];
  onboarding_step?: string;
}

const COOPERATION_PATHS = [
  { id: 'education', name: 'Collaborative Education', emoji: '📚', color: '#3B82F6' },
  { id: 'economy', name: 'Social Economy', emoji: '💰', color: '#10B981' },
  { id: 'wellbeing', name: 'Common Wellbeing', emoji: '🫶', color: '#EC4899' },
  { id: 'technology', name: 'Cooperative Technology', emoji: '💻', color: '#8B5CF6' },
  { id: 'governance', name: 'Collective Governance', emoji: '🏛️', color: '#F59E0B' },
  { id: 'community', name: 'Community Connection', emoji: '🤝', color: '#EF4444' },
  { id: 'media', name: 'Collaborative Media', emoji: '🎨', color: '#6366F1' },
  { id: 'planet', name: 'Common Planet', emoji: '🌍', color: '#059669' },
];

export default function DashboardClient({ user }: { user: User }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const userPaths = user.paths || [];

  return (
    <div className="min-h-screen bg-bg-0">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {user.avatar_url && (
                <Avatar src={user.avatar_url} alt={user.name || 'User'} size="lg" />
              )}
              <h1 className="text-2xl font-bold text-ink-900">
                Welcome back{user.name ? `, ${user.name}` : ''}!
              </h1>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => router.push('/profile')}>
                Profile
              </Button>
              <Button variant="link" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="flex items-center gap-4 p-6">
            <div className="text-4xl">👥</div>
            <div>
              <div className="text-3xl font-bold text-ink-900">1,247</div>
              <div className="text-sm text-ink-700">Active Members</div>
            </div>
          </Card>

          <Card className="flex items-center gap-4 p-6">
            <div className="text-4xl">📋</div>
            <div>
              <div className="text-3xl font-bold text-ink-900">23</div>
              <div className="text-sm text-ink-700">Open Proposals</div>
            </div>
          </Card>

          <Card className="flex items-center gap-4 p-6">
            <div className="text-4xl">🤲</div>
            <div>
              <div className="text-3xl font-bold text-ink-900">89</div>
              <div className="text-sm text-ink-700">Mutual Aid Requests</div>
            </div>
          </Card>

          <Card className="flex items-center gap-4 p-6">
            <div className="text-4xl">✨</div>
            <div>
              <div className="text-3xl font-bold text-ink-900">{userPaths.length}/8</div>
              <div className="text-sm text-ink-700">Your Paths</div>
            </div>
          </Card>
        </section>

        {/* Your Journey */}
        {userPaths.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-ink-900 mb-4">Your Cooperation Paths</h2>
            <div className="flex flex-wrap gap-3">
              {COOPERATION_PATHS.filter((p) => userPaths.includes(p.id)).map((path) => (
                <Badge key={path.id} variant="brand" className="text-base px-4 py-2">
                  {path.emoji} {path.name}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* Cooperation Paths Explorer */}
        <section className="mb-8">
          <Card>
            <h2 className="text-2xl font-bold text-ink-900 mb-2">Explore Cooperation Paths</h2>
            <p className="text-ink-700 mb-6">
              Choose the paths that resonate with you. You can always add or remove paths later.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {COOPERATION_PATHS.map((path) => {
                const isActive = userPaths.includes(path.id);
                return (
                  <Card
                    key={path.id}
                    className={cn(
                      "flex flex-col items-center text-center p-6 cursor-pointer hover:shadow-lg transition-shadow",
                      isActive && "border-brand-500 bg-brand-50"
                    )}
                  >
                    <div className="text-4xl mb-3">{path.emoji}</div>
                    <div className="font-semibold text-ink-900 mb-2">{path.name}</div>
                    {isActive && <Badge variant="success">Active</Badge>}
                  </Card>
                );
              })}
            </div>
          </Card>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-2xl font-bold text-ink-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card
              className="flex flex-col items-center text-center p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push('/profile')}
            >
              <div className="text-4xl mb-3">👤</div>
              <div className="font-semibold text-ink-900 mb-2">Edit Profile</div>
              <div className="text-sm text-ink-700">Update your bio, skills, and preferences</div>
            </Card>

            <Card className="flex flex-col items-center text-center p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-3">🗳️</div>
              <div className="font-semibold text-ink-900 mb-2">Browse Proposals</div>
              <div className="text-sm text-ink-700">Vote on community decisions</div>
            </Card>

            <Card className="flex flex-col items-center text-center p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-3">🤝</div>
              <div className="font-semibold text-ink-900 mb-2">Offer Help</div>
              <div className="text-sm text-ink-700">Share your skills with the community</div>
            </Card>

            <Card className="flex flex-col items-center text-center p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-3">📚</div>
              <div className="font-semibold text-ink-900 mb-2">Learn & Connect</div>
              <div className="text-sm text-ink-700">Find events and educational resources</div>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
