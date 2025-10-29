'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import styles from './profile.module.css';

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
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Your Profile</h1>
            <div className={styles.headerActions}>
              <button onClick={() => setIsEditing(true)} className={styles.button}>
                Edit Profile
              </button>
              <button onClick={() => router.push('/dashboard')} className={styles.buttonSecondary}>
                Dashboard
              </button>
            </div>
          </div>
        </header>

        <main className={styles.main}>
          <div className={styles.profileCard}>
            {user.avatar_url && (
              <img src={user.avatar_url} alt="Avatar" className={styles.avatar} />
            )}

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Basic Info</h2>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Email</label>
                <p className={styles.fieldValue}>{user.email}</p>
              </div>
              {user.name && (
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Name</label>
                  <p className={styles.fieldValue}>{user.name}</p>
                </div>
              )}
              {user.username && (
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Username</label>
                  <p className={styles.fieldValue}>@{user.username}</p>
                </div>
              )}
              {user.bio && (
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Bio</label>
                  <p className={styles.fieldValue}>{user.bio}</p>
                </div>
              )}
            </div>

            {(user.city || user.state || user.country) && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Location</h2>
                <p className={styles.fieldValue}>
                  {[user.city, user.state, user.country].filter(Boolean).join(', ')}
                </p>
              </div>
            )}

            {user.paths && user.paths.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Your Cooperation Paths</h2>
                <div className={styles.pathsList}>
                  {COOPERATION_PATHS.filter((p) => user.paths?.includes(p.id)).map((path) => (
                    <div key={path.id} className={styles.pathBadge}>
                      <span>{path.emoji}</span>
                      <span>{path.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {user.skills && user.skills.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Skills</h2>
                <div className={styles.skillsList}>
                  {user.skills.map((skill, i) => (
                    <span key={i} className={styles.skillTag}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {user.can_offer && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>What I Can Offer</h2>
                <p className={styles.fieldValue}>{user.can_offer}</p>
              </div>
            )}

            {user.seeking_help && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>What I'm Seeking</h2>
                <p className={styles.fieldValue}>{user.seeking_help}</p>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Edit Mode
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Edit Profile</h1>
          <div className={styles.headerActions}>
            <button onClick={() => setIsEditing(false)} className={styles.buttonSecondary}>
              Cancel
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <form onSubmit={handleSubmit} className={styles.profileCard}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Basic Info</h2>

            <div className={styles.inputGroup}>
              <label htmlFor="name" className={styles.label}>
                Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
                className={styles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="username" className={styles.label}>
                Username
              </label>
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="username"
                className={styles.input}
              />
              <p className={styles.hint}>3-50 characters, letters, numbers, underscores, hyphens</p>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="bio" className={styles.label}>
                Bio
              </label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself"
                className={styles.textarea}
                rows={4}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="avatar_url" className={styles.label}>
                Avatar URL
              </label>
              <input
                id="avatar_url"
                type="url"
                value={formData.avatar_url}
                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Location</h2>

            <div className={styles.inputGroup}>
              <label htmlFor="city" className={styles.label}>
                City
              </label>
              <input
                id="city"
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Your city"
                className={styles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="state" className={styles.label}>
                State/Province
              </label>
              <input
                id="state"
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="Your state or province"
                className={styles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="country" className={styles.label}>
                Country
              </label>
              <input
                id="country"
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="Your country"
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Cooperation Paths</h2>
            <p className={styles.hint}>Select the paths that resonate with you</p>
            <div className={styles.pathsGrid}>
              {COOPERATION_PATHS.map((path) => {
                const isSelected = formData.paths.includes(path.id);
                return (
                  <button
                    key={path.id}
                    type="button"
                    onClick={() => togglePath(path.id)}
                    className={`${styles.pathOption} ${isSelected ? styles.pathOptionActive : ''}`}
                  >
                    <span className={styles.pathEmoji}>{path.emoji}</span>
                    <span className={styles.pathName}>{path.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Skills & Interests</h2>

            <div className={styles.inputGroup}>
              <label htmlFor="skills" className={styles.label}>
                Skills
              </label>
              <input
                id="skills"
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="e.g. Web Development, Graphic Design, Community Organizing"
                className={styles.input}
              />
              <p className={styles.hint}>Separate multiple skills with commas</p>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="can_offer" className={styles.label}>
                What I Can Offer
              </label>
              <textarea
                id="can_offer"
                value={formData.can_offer}
                onChange={(e) => setFormData({ ...formData, can_offer: e.target.value })}
                placeholder="How can you help the community?"
                className={styles.textarea}
                rows={3}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="seeking_help" className={styles.label}>
                What I'm Seeking
              </label>
              <textarea
                id="seeking_help"
                value={formData.seeking_help}
                onChange={(e) => setFormData({ ...formData, seeking_help: e.target.value })}
                placeholder="What kind of help are you looking for?"
                className={styles.textarea}
                rows={3}
              />
            </div>
          </div>

          {state === 'error' && <div className={styles.error}>{errorMessage}</div>}

          <button type="submit" className={styles.submitButton} disabled={state === 'saving'}>
            {state === 'saving' ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </main>
    </div>
  );
}
