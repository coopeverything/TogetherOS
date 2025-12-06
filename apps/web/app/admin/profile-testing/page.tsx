'use client';

import * as React from 'react';
import { useState } from 'react';
import { TagInput, ProfileCompletionIndicator } from '@togetheros/ui/profiles';
import { Card, Button, Badge, Avatar } from '@/components/ui';

// Using same User interface as ProfileClient
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
  'TypeScript',
  'React',
  'Node.js',
  'PostgreSQL',
  'UI/UX Design',
  'Python',
  'GraphQL',
  'Community Organizing',
  'Project Management',
];

// Sample profile data at different completion levels
const SAMPLE_PROFILES = {
  minimal: {
    id: '1',
    email: 'minimal@example.com',
    email_verified: true,
    name: 'Min User',
    paths: [],
    skills: [],
  } as User,
  partial: {
    id: '2',
    email: 'partial@example.com',
    email_verified: true,
    name: 'Partial User',
    username: 'partialuser',
    bio: 'Just getting started',
    city: 'Portland',
    paths: ['technology'],
    skills: ['JavaScript', 'React'],
  } as User,
  complete: {
    id: '3',
    email: 'complete@example.com',
    email_verified: true,
    name: 'Alex Rivera',
    username: 'alexrivera',
    bio: 'Full-stack developer passionate about cooperative technology and sustainable communities. Building tools for collective action.',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    city: 'Portland',
    state: 'OR',
    country: 'USA',
    paths: ['technology', 'economy', 'planet'],
    skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'UI/UX Design'],
    can_offer: 'Mentoring in web development, code reviews, architecture consulting, and workshop facilitation',
    seeking_help: 'Learning about cooperative business models and regenerative agriculture',
  } as User,
};

// Simple ProfileCard component for testing
function SimpleProfileCard({ user }: { user: User }) {
  const userPaths = COOPERATION_PATHS.filter(p => user.paths?.includes(p.id));

  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <Avatar
          src={user.avatar_url}
          alt={user.name || user.username || 'User'}
          className="w-16 h-16"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold text-ink-900">
            {user.name || user.username || 'Anonymous'}
          </h3>
          {user.username && user.name && (
            <p className="text-base text-ink-400">@{user.username}</p>
          )}
          {(user.city || user.state || user.country) && (
            <p className="text-base text-ink-400 mt-1">
              {[user.city, user.state, user.country].filter(Boolean).join(', ')}
            </p>
          )}
        </div>
      </div>

      {user.bio && (
        <p className="mt-4 text-ink-700 text-base">{user.bio}</p>
      )}

      {userPaths.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-ink-700 mb-2">Cooperation Paths</h4>
          <div className="flex flex-wrap gap-2">
            {userPaths.map(path => (
              <Badge key={path.id} variant="brand">
                {path.emoji} {path.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {user.skills && user.skills.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-ink-700 mb-2">Skills</h4>
          <div className="flex flex-wrap gap-2">
            {user.skills.map(skill => (
              <Badge key={skill} variant="default">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {user.can_offer && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-ink-700 mb-1">Can Offer</h4>
          <p className="text-base text-ink-400">{user.can_offer}</p>
        </div>
      )}

      {user.seeking_help && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-ink-700 mb-1">Seeking Help</h4>
          <p className="text-base text-ink-400">{user.seeking_help}</p>
        </div>
      )}
    </Card>
  );
}

export default function ProfileTestPage() {
  const [activeTab, setActiveTab] = useState<'showcase' | 'demo' | 'api'>('showcase');
  const [demoProfile, setDemoProfile] = useState<User>(SAMPLE_PROFILES.partial);
  const [apiResponse, setApiResponse] = useState<string>('');
  const [apiLoading, setApiLoading] = useState(false);

  const handleDemoUpdate = (field: keyof User, value: any) => {
    setDemoProfile(prev => ({ ...prev, [field]: value }));
  };

  const loadSampleData = (level: 'minimal' | 'partial' | 'complete') => {
    setDemoProfile(SAMPLE_PROFILES[level]);
  };

  const testGetProfile = async (username: string) => {
    setApiLoading(true);
    try {
      const res = await fetch(`/api/profile/${username}`);
      const data = await res.json();
      setApiResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setApiResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setApiLoading(false);
    }
  };

  const testUpdateProfile = async (updates: string) => {
    setApiLoading(true);
    try {
      const parsed = JSON.parse(updates);

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      setApiResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setApiResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setApiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-1 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ink-900">Profile Components Test Page</h1>
          <p className="mt-2 text-ink-400">
            Comprehensive testing interface for all profile-related UI components, interactions, and API endpoints.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-border">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'showcase' as const, label: 'Component Showcase' },
              { id: 'demo' as const, label: 'Interactive Demo' },
              { id: 'api' as const, label: 'API Testing' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-base transition-colors
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-ink-400 hover:text-ink-700 hover:border-border'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-bg-0 rounded-lg shadow-sm p-6">
          {/* Component Showcase Tab */}
          {activeTab === 'showcase' && (
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Profile Cards</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-base font-medium text-ink-700 mb-3">Complete Profile</h3>
                    <SimpleProfileCard user={SAMPLE_PROFILES.complete} />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-ink-700 mb-3">Partial Profile</h3>
                    <SimpleProfileCard user={SAMPLE_PROFILES.partial} />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-ink-700 mb-3">Minimal Profile</h3>
                    <SimpleProfileCard user={SAMPLE_PROFILES.minimal} />
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">ProfileCompletionIndicator</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-base font-medium text-ink-700 mb-3">Minimal (Getting Started)</h3>
                    <ProfileCompletionIndicator user={SAMPLE_PROFILES.minimal} />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-ink-700 mb-3">Partial (Almost There)</h3>
                    <ProfileCompletionIndicator user={SAMPLE_PROFILES.partial} />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-ink-700 mb-3">Complete</h3>
                    <ProfileCompletionIndicator user={SAMPLE_PROFILES.complete} />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-ink-700 mb-3">With showDetails=false</h3>
                    <ProfileCompletionIndicator user={SAMPLE_PROFILES.complete} showDetails={false} />
                    <p className="text-base text-ink-400 mt-2">(Hidden when complete and showDetails=false)</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">TagInput Component</h2>
                <div className="max-w-2xl">
                  <h3 className="text-base font-medium text-ink-700 mb-3">Interactive Skills Input</h3>
                  <TagInput
                    value={['TypeScript', 'React']}
                    onChange={(tags) => console.log('Tags changed:', tags)}
                    placeholder="Add skills..."
                    suggestions={COMMON_SKILLS}
                  />
                  <p className="mt-2 text-base text-ink-400">
                    Type to add tags, press Enter to confirm. Try typing &apos;Type&apos; to see suggestions.
                  </p>
                </div>
              </section>
            </div>
          )}

          {/* Interactive Demo Tab */}
          {activeTab === 'demo' && (
            <div className="space-y-6">
              <div className="flex gap-4 mb-6">
                <Button
                  onClick={() => loadSampleData('minimal')}
                  variant="secondary"
                >
                  Load Minimal Profile
                </Button>
                <Button
                  onClick={() => loadSampleData('partial')}
                  variant="secondary"
                >
                  Load Partial Profile
                </Button>
                <Button
                  onClick={() => loadSampleData('complete')}
                  variant="secondary"
                >
                  Load Complete Profile
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form Side */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold">Edit Profile</h2>

                  <div>
                    <label className="block text-base font-medium text-ink-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={demoProfile.name || ''}
                      onChange={(e) => handleDemoUpdate('name', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-ink-700 mb-1">Username</label>
                    <input
                      type="text"
                      value={demoProfile.username || ''}
                      onChange={(e) => handleDemoUpdate('username', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="username"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-ink-700 mb-1">Bio</label>
                    <textarea
                      value={demoProfile.bio || ''}
                      onChange={(e) => handleDemoUpdate('bio', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-ink-700 mb-1">City</label>
                    <input
                      type="text"
                      value={demoProfile.city || ''}
                      onChange={(e) => handleDemoUpdate('city', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your city"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-ink-700 mb-1">Skills</label>
                    <TagInput
                      value={demoProfile.skills || []}
                      onChange={(skills) => handleDemoUpdate('skills', skills)}
                      placeholder="Add skills..."
                      suggestions={COMMON_SKILLS}
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-ink-700 mb-1">What I Can Offer</label>
                    <textarea
                      value={demoProfile.can_offer || ''}
                      onChange={(e) => handleDemoUpdate('can_offer', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                      placeholder="How can you help others?"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-ink-700 mb-1">What I&apos;m Seeking</label>
                    <textarea
                      value={demoProfile.seeking_help || ''}
                      onChange={(e) => handleDemoUpdate('seeking_help', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                      placeholder="What kind of help are you looking for?"
                    />
                  </div>
                </div>

                {/* Preview Side */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold">Live Preview</h2>
                  <ProfileCompletionIndicator user={demoProfile} />
                  <SimpleProfileCard user={demoProfile} />
                </div>
              </div>
            </div>
          )}

          {/* API Testing Tab */}
          {activeTab === 'api' && (
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">GET /api/profile/[username]</h2>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <input
                      type="text"
                      placeholder="Enter username"
                      className="flex-1 px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      id="get-username"
                    />
                    <Button
                      onClick={() => {
                        const input = document.getElementById('get-username') as HTMLInputElement;
                        testGetProfile(input.value);
                      }}
                      disabled={apiLoading}
                    >
                      {apiLoading ? 'Loading...' : 'Fetch Profile'}
                    </Button>
                  </div>
                  <div className="text-base text-ink-400">
                    Try: <code className="bg-bg-2 px-3 py-1.5 rounded">alexrivera</code> or any other username
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">PUT /api/profile</h2>
                <div className="space-y-4">
                  <textarea
                    id="put-data"
                    className="w-full px-3 py-2 border border-border rounded-md font-mono text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={10}
                    placeholder='{"name": "Test User", "bio": "Testing the API..."}'
                    defaultValue={JSON.stringify({
                      name: 'Test User',
                      username: 'testuser',
                      bio: 'Testing the profile update API',
                      city: 'Test City',
                      skills: ['Testing', 'API'],
                    }, null, 2)}
                  />
                  <Button
                    onClick={() => {
                      const textarea = document.getElementById('put-data') as HTMLTextAreaElement;
                      testUpdateProfile(textarea.value);
                    }}
                    disabled={apiLoading}
                  >
                    {apiLoading ? 'Sending...' : 'Update Profile'}
                  </Button>
                  <div className="text-base text-ink-400">
                    Note: This will send the JSON to the API. Authentication may be required.
                  </div>
                </div>
              </section>

              {/* API Response */}
              {apiResponse && (
                <section>
                  <h2 className="text-2xl font-semibold mb-4">Response</h2>
                  <pre className="bg-bg-0 border border-border text-ink-900 p-4 rounded-md overflow-x-auto text-base">
                    {apiResponse}
                  </pre>
                </section>
              )}

              <section className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Note about Authentication</h3>
                <p className="text-base text-blue-800">
                  The actual API endpoints require authentication. This test page demonstrates the UI and client-side
                  validation. To test with real API calls, you&apos;ll need to be logged in. API calls here may return 401
                  errors if you&apos;re not authenticated.
                </p>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
