'use client';

import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';

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
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.welcomeTitle}>
            Welcome back{user.name ? `, ${user.name}` : ''}!
          </h1>
          <div className={styles.headerActions}>
            <button onClick={() => router.push('/profile')} className={styles.headerButton}>
              Profile
            </button>
            <button onClick={handleLogout} className={styles.headerButtonSecondary}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* Stats Cards */}
        <section className={styles.statsSection}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>👥</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>1,247</div>
              <div className={styles.statLabel}>Active Members</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>📋</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>23</div>
              <div className={styles.statLabel}>Open Proposals</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>🤲</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>89</div>
              <div className={styles.statLabel}>Mutual Aid Requests</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>✨</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{userPaths.length}/8</div>
              <div className={styles.statLabel}>Your Paths</div>
            </div>
          </div>
        </section>

        {/* Your Journey */}
        {userPaths.length > 0 && (
          <section className={styles.journeySection}>
            <h2 className={styles.sectionTitle}>Your Cooperation Paths</h2>
            <div className={styles.pathsList}>
              {COOPERATION_PATHS.filter((p) => userPaths.includes(p.id)).map((path) => (
                <div key={path.id} className={styles.activePathCard}>
                  <div className={styles.pathEmoji}>{path.emoji}</div>
                  <div className={styles.pathName}>{path.name}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Cooperation Paths Explorer */}
        <section className={styles.pathsSection}>
          <h2 className={styles.sectionTitle}>Explore Cooperation Paths</h2>
          <p className={styles.sectionDesc}>
            Choose the paths that resonate with you. You can always add or remove paths later.
          </p>
          <div className={styles.pathsGrid}>
            {COOPERATION_PATHS.map((path) => {
              const isActive = userPaths.includes(path.id);
              return (
                <div
                  key={path.id}
                  className={`${styles.pathCard} ${isActive ? styles.pathCardActive : ''}`}
                  style={{ borderColor: path.color }}
                >
                  <div className={styles.pathCardEmoji}>{path.emoji}</div>
                  <div className={styles.pathCardName}>{path.name}</div>
                  {isActive && <div className={styles.pathCardBadge}>Active</div>}
                </div>
              );
            })}
          </div>
        </section>

        {/* Quick Actions */}
        <section className={styles.actionsSection}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
          <div className={styles.actionsGrid}>
            <button onClick={() => router.push('/profile')} className={styles.actionCard}>
              <div className={styles.actionIcon}>👤</div>
              <div className={styles.actionTitle}>Edit Profile</div>
              <div className={styles.actionDesc}>Update your bio, skills, and preferences</div>
            </button>

            <button className={styles.actionCard}>
              <div className={styles.actionIcon}>🗳️</div>
              <div className={styles.actionTitle}>Browse Proposals</div>
              <div className={styles.actionDesc}>Vote on community decisions</div>
            </button>

            <button className={styles.actionCard}>
              <div className={styles.actionIcon}>🤝</div>
              <div className={styles.actionTitle}>Offer Help</div>
              <div className={styles.actionDesc}>Share your skills with the community</div>
            </button>

            <button className={styles.actionCard}>
              <div className={styles.actionIcon}>📚</div>
              <div className={styles.actionTitle}>Learn & Connect</div>
              <div className={styles.actionDesc}>Find events and educational resources</div>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
