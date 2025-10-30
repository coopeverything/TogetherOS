'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Badge, Avatar, Input, Textarea, Label, Alert } from '@/components/ui';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  email: string;
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

export default function ProfileClient({ initialUser }: { initialUser: User }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(initialUser);
  const [formData, setFormData] = useState({
    name: user.name || '',
    username: user.username || '',
    bio: user.bio || '',
    avatar_url: user.avatar_url || '',
    city: user.city || '',
    state: user.state || '',
    country: user.country || '',
    paths: user.paths || [],
    skills: (user.skills || []).join(', '),
    can_offer: user.can_offer || '',
    seeking_help: user.seeking_help || '',
  });
  const [state, setState] = useState<'idle' | 'saving' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setState('saving');
    setErrorMessage('');

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          skills: formData.skills
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setState('error');
        setErrorMessage(data.error || 'Failed to update profile');
        return;
      }

      setUser(data.user);
      setState('idle');
      setIsEditing(false);
    } catch (error) {
      console.error('Update error:', error);
      setState('error');
      setErrorMessage('Failed to update. Please try again.');
    }
  };

  const togglePath = (pathId: string) => {
    const newPaths = formData.paths.includes(pathId)
      ? formData.paths.filter((p) => p !== pathId)
      : [...formData.paths, pathId];
    setFormData({ ...formData, paths: newPaths });
  };

  if (!isEditing) {
    // View Mode
    return (
      <div className="min-h-screen bg-bg-0">
        <header className="bg-white border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-ink-900">Your Profile</h1>
              <div className="flex gap-3">
                <Button variant="default" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
                <Button variant="secondary" onClick={() => router.push('/dashboard')}>
                  Dashboard
                </Button>
              </div>
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
                <h2 className="text-xl font-semibold text-ink-900 mb-4">Basic Info</h2>
                <div className="space-y-3">
                  <div>
                    <Label className="text-ink-700">Email</Label>
                    <p className="text-ink-900">{user.email}</p>
                  </div>
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
                  <h2 className="text-xl font-semibold text-ink-900 mb-4">Your Cooperation Paths</h2>
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
            </div>
          </Card>
        </main>
      </div>
    );
  }

  // Edit Mode
  return (
    <div className="min-h-screen bg-bg-0">
      <header className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-ink-900">Edit Profile</h1>
            <Button variant="secondary" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <Card className="p-8 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-ink-900 mb-4">Basic Info</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="username"
                  />
                  <p className="text-sm text-ink-700 mt-1">
                    3-50 characters, letters, numbers, underscores, hyphens
                  </p>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="avatar_url">Avatar URL</Label>
                  <Input
                    id="avatar_url"
                    type="url"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-ink-900 mb-4">Location</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Your city"
                  />
                </div>

                <div>
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="Your state or province"
                  />
                </div>

                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Your country"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-ink-900 mb-2">Cooperation Paths</h2>
              <p className="text-sm text-ink-700 mb-4">Select the paths that resonate with you</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {COOPERATION_PATHS.map((path) => {
                  const isSelected = formData.paths.includes(path.id);
                  return (
                    <Card
                      key={path.id}
                      className={cn(
                        "flex flex-col items-center p-4 cursor-pointer hover:shadow-md transition-shadow",
                        isSelected && "border-brand-500 bg-brand-50"
                      )}
                      onClick={() => togglePath(path.id)}
                    >
                      <div className="text-3xl mb-2">{path.emoji}</div>
                      <div className="text-sm text-center font-medium">{path.name}</div>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-ink-900 mb-4">Skills & Interests</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="skills">Skills</Label>
                  <Input
                    id="skills"
                    type="text"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="e.g. Web Development, Graphic Design, Community Organizing"
                  />
                  <p className="text-sm text-ink-700 mt-1">Separate multiple skills with commas</p>
                </div>

                <div>
                  <Label htmlFor="can_offer">What I Can Offer</Label>
                  <Textarea
                    id="can_offer"
                    value={formData.can_offer}
                    onChange={(e) => setFormData({ ...formData, can_offer: e.target.value })}
                    placeholder="How can you help the community?"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="seeking_help">What I'm Seeking</Label>
                  <Textarea
                    id="seeking_help"
                    value={formData.seeking_help}
                    onChange={(e) => setFormData({ ...formData, seeking_help: e.target.value })}
                    placeholder="What kind of help are you looking for?"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {state === 'error' && (
              <Alert variant="danger" title="Error">
                {errorMessage}
              </Alert>
            )}

            <Button type="submit" variant="default" disabled={state === 'saving'} className="w-full">
              {state === 'saving' ? 'Saving...' : 'Save Changes'}
            </Button>
          </Card>
        </form>
      </main>
    </div>
  );
}
