'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Badge, Avatar, Input, EmptyState } from '@/components/ui';

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

export function ProfilesClient() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const response = await fetch('/api/profiles');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    // Search filter
    const matchesSearch =
      !searchQuery ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.skills?.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      );

    // Path filter
    const matchesPath =
      !selectedPath || user.paths?.includes(selectedPath);

    return matchesSearch && matchesPath;
  });

  return (
    <div className="min-h-screen bg-bg-0">
      <header className="bg-white dark:bg-gray-800 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-ink-900">Member Directory</h1>
            <Button variant="secondary" onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-ink-900 mb-2">
                Search members
              </label>
              <Input
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, username, bio, or skills..."
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-900 mb-2">
                Filter by Cooperation Path
              </label>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedPath === null ? 'brand' : 'default'}
                  className="cursor-pointer"
                  onClick={() => setSelectedPath(null)}
                >
                  All
                </Badge>
                {COOPERATION_PATHS.map((path) => (
                  <Badge
                    key={path.id}
                    variant={selectedPath === path.id ? 'brand' : 'default'}
                    className="cursor-pointer"
                    onClick={() => setSelectedPath(path.id)}
                  >
                    {path.emoji} {path.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-ink-700">Loading members...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            title="No members found"
            description="Try adjusting your search or filters"
            icon="users"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <Card
                key={user.id}
                className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => {
                  if (user.username) {
                    router.push(`/profile/${user.username}`);
                  }
                }}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar
                    src={user.avatar_url}
                    alt={user.name || 'Member'}
                    size="lg"
                  />

                  <div className="w-full">
                    <h3 className="text-lg font-semibold text-ink-900">
                      {user.name || user.username || 'Anonymous'}
                    </h3>
                    {user.username && (
                      <p className="text-sm text-ink-700">@{user.username}</p>
                    )}
                  </div>

                  {user.bio && (
                    <p className="text-sm text-ink-700 line-clamp-2">
                      {user.bio}
                    </p>
                  )}

                  {(user.city || user.state || user.country) && (
                    <p className="text-xs text-ink-700">
                      {[user.city, user.state, user.country]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  )}

                  {user.paths && user.paths.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-center">
                      {COOPERATION_PATHS.filter((p) =>
                        user.paths?.includes(p.id)
                      )
                        .slice(0, 3)
                        .map((path) => (
                          <span
                            key={path.id}
                            className="text-xs"
                            title={path.name}
                          >
                            {path.emoji}
                          </span>
                        ))}
                      {user.paths.length > 3 && (
                        <span className="text-xs text-ink-700">
                          +{user.paths.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {user.skills && user.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-center">
                      {user.skills.slice(0, 3).map((skill, i) => (
                        <Badge key={i} variant="default" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {user.skills.length > 3 && (
                        <Badge variant="default" className="text-xs">
                          +{user.skills.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredUsers.length > 0 && (
          <div className="mt-6 text-center text-sm text-ink-700">
            Showing {filteredUsers.length} of {users.length} members
          </div>
        )}
      </main>
    </div>
  );
}
