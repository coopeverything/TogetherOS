'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Badge, Avatar, Input, Textarea, Label, Alert } from '@/components/ui';
import { TagInput, ProfileCompletionIndicator } from '@togetheros/ui/profiles';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  email: string;
  email_verified?: boolean;
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
  profile_visibility?: 'public' | 'members' | 'private';
  social_links?: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
    mastodon?: string;
    bluesky?: string;
  };
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

const COMMON_SKILLS = [
  'Web Development',
  'Mobile Development',
  'UI/UX Design',
  'Graphic Design',
  'Community Organizing',
  'Event Planning',
  'Project Management',
  'Teaching',
  'Writing',
  'Public Speaking',
  'Social Media',
  'Marketing',
  'Fundraising',
  'Legal Advice',
  'Accounting',
  'Data Analysis',
  'Research',
  'Translation',
  'Video Editing',
  'Photography',
  'Illustration',
  'Carpentry',
  'Gardening',
  'Cooking',
  'Childcare',
  'Elder Care',
  'Mental Health Support',
  'Conflict Resolution',
  'Facilitation',
  'Strategic Planning',
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
    skills: user.skills || [],
    can_offer: user.can_offer || '',
    seeking_help: user.seeking_help || '',
    profile_visibility: user.profile_visibility || 'public',
    social_links: {
      github: user.social_links?.github || '',
      twitter: user.social_links?.twitter || '',
      linkedin: user.social_links?.linkedin || '',
      website: user.social_links?.website || '',
      mastodon: user.social_links?.mastodon || '',
      bluesky: user.social_links?.bluesky || '',
    },
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
        body: JSON.stringify(formData),
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
                {user.username && (
                  <Button
                    variant="secondary"
                    onClick={() => router.push(`/profile/${user.username}`)}
                  >
                    View Public Profile
                  </Button>
                )}
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

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Profile Completion Indicator */}
          <ProfileCompletionIndicator user={user} />

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
                    <div className="flex items-center gap-2">
                      <p className="text-ink-900">{user.email}</p>
                      {user.email_verified ? (
                        <Badge variant="success">Verified</Badge>
                      ) : (
                        <Badge variant="warning">Not Verified</Badge>
                      )}
                    </div>
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
                  <Label>Avatar</Label>
                  <AvatarUpload
                    value={formData.avatar_url}
                    onChange={(avatar_url) => setFormData({ ...formData, avatar_url })}
                    name={formData.name || 'User'}
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
                  <TagInput
                    value={formData.skills}
                    onChange={(skills) => setFormData({ ...formData, skills })}
                    placeholder="Type a skill and press Enter"
                    suggestions={COMMON_SKILLS}
                    maxTags={20}
                  />
                  <p className="text-sm text-ink-700 mt-1">Add up to 20 skills. Start typing to see suggestions.</p>
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

            <div>
              <h2 className="text-xl font-semibold text-ink-900 mb-4">Social Links</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="github">GitHub Username</Label>
                  <Input
                    id="github"
                    type="text"
                    value={formData.social_links.github}
                    onChange={(e) => setFormData({
                      ...formData,
                      social_links: { ...formData.social_links, github: e.target.value }
                    })}
                    placeholder="username"
                  />
                </div>

                <div>
                  <Label htmlFor="twitter">Twitter/X Username</Label>
                  <Input
                    id="twitter"
                    type="text"
                    value={formData.social_links.twitter}
                    onChange={(e) => setFormData({
                      ...formData,
                      social_links: { ...formData.social_links, twitter: e.target.value }
                    })}
                    placeholder="username"
                  />
                </div>

                <div>
                  <Label htmlFor="linkedin">LinkedIn Username</Label>
                  <Input
                    id="linkedin"
                    type="text"
                    value={formData.social_links.linkedin}
                    onChange={(e) => setFormData({
                      ...formData,
                      social_links: { ...formData.social_links, linkedin: e.target.value }
                    })}
                    placeholder="username"
                  />
                </div>

                <div>
                  <Label htmlFor="mastodon">Mastodon Handle</Label>
                  <Input
                    id="mastodon"
                    type="text"
                    value={formData.social_links.mastodon}
                    onChange={(e) => setFormData({
                      ...formData,
                      social_links: { ...formData.social_links, mastodon: e.target.value }
                    })}
                    placeholder="@username@instance.social"
                  />
                </div>

                <div>
                  <Label htmlFor="bluesky">Bluesky Handle</Label>
                  <Input
                    id="bluesky"
                    type="text"
                    value={formData.social_links.bluesky}
                    onChange={(e) => setFormData({
                      ...formData,
                      social_links: { ...formData.social_links, bluesky: e.target.value }
                    })}
                    placeholder="username.bsky.social"
                  />
                </div>

                <div>
                  <Label htmlFor="website">Personal Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.social_links.website}
                    onChange={(e) => setFormData({
                      ...formData,
                      social_links: { ...formData.social_links, website: e.target.value }
                    })}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-ink-900 mb-2">Privacy Settings</h2>
              <p className="text-sm text-ink-700 mb-4">Control who can see your profile</p>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 border border-border rounded-md cursor-pointer hover:bg-bg-1 transition-colors">
                  <input
                    type="radio"
                    name="profile_visibility"
                    value="public"
                    checked={formData.profile_visibility === 'public'}
                    onChange={(e) => setFormData({ ...formData, profile_visibility: e.target.value as 'public' | 'members' | 'private' })}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="font-medium text-ink-900">Public</div>
                    <div className="text-sm text-ink-700">Anyone can view your profile</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 border border-border rounded-md cursor-pointer hover:bg-bg-1 transition-colors">
                  <input
                    type="radio"
                    name="profile_visibility"
                    value="members"
                    checked={formData.profile_visibility === 'members'}
                    onChange={(e) => setFormData({ ...formData, profile_visibility: e.target.value as 'public' | 'members' | 'private' })}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="font-medium text-ink-900">Members Only</div>
                    <div className="text-sm text-ink-700">Only logged-in members can view your profile</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 border border-border rounded-md cursor-pointer hover:bg-bg-1 transition-colors">
                  <input
                    type="radio"
                    name="profile_visibility"
                    value="private"
                    checked={formData.profile_visibility === 'private'}
                    onChange={(e) => setFormData({ ...formData, profile_visibility: e.target.value as 'public' | 'members' | 'private' })}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="font-medium text-ink-900">Private</div>
                    <div className="text-sm text-ink-700">Only you can view your profile</div>
                  </div>
                </label>
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
