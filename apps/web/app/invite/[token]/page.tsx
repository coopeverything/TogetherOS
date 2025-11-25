'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import styles from './invite.module.css';

interface InvitationData {
  id: string;
  inviterName: string;
  inviteeEmail: string;
  groupName: string;
  groupLocation?: string;
  personalMessage?: string;
  expiresAt: string;
  rpReward: number;
  status: string;
}

export default function InviteLandingPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInvitation() {
      try {
        const response = await fetch(`/api/invitations/${token}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to load invitation');
          if (data.invitation) {
            setInvitation(data.invitation);
          }
          return;
        }

        setInvitation(data.invitation);
      } catch (err) {
        setError('Failed to load invitation');
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchInvitation();
    }
  }, [token]);

  const handleAcceptInvitation = () => {
    // Store token in sessionStorage for use after signup
    sessionStorage.setItem('invitationToken', token);
    router.push(`/signup?invite=${token}`);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.loading}>Loading invitation...</div>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Invitation Not Found</h1>
          <p className={styles.intro}>{error}</p>
          <Link href="/signup" className={styles.button}>
            Sign up for TogetherOS
          </Link>
        </div>
      </div>
    );
  }

  const isExpired = invitation?.status === 'expired' ||
    (invitation?.expiresAt && new Date(invitation.expiresAt) < new Date());
  const isAlreadyUsed = invitation?.status === 'accepted' || invitation?.status === 'declined';

  if (isExpired || isAlreadyUsed) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>
            {isExpired ? 'Invitation Expired' : 'Invitation Already Used'}
          </h1>
          <p className={styles.intro}>
            {isExpired
              ? 'This invitation has expired. Ask your friend to send you a new one.'
              : `This invitation has already been ${invitation?.status}.`}
          </p>
          <Link href="/signup" className={styles.button}>
            Sign up for TogetherOS
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>You&apos;ve Been Invited!</h1>

        <div className={styles.inviterSection}>
          <span className={styles.inviterLabel}>Invited by</span>
          <span className={styles.inviterName}>{invitation?.inviterName}</span>
        </div>

        {invitation?.personalMessage && (
          <div className={styles.messageBox}>
            <p className={styles.messageText}>&quot;{invitation.personalMessage}&quot;</p>
          </div>
        )}

        <div className={styles.groupSection}>
          <p className={styles.groupLabel}>Join this community:</p>
          <p className={styles.groupName}>{invitation?.groupName}</p>
          {invitation?.groupLocation && (
            <p className={styles.groupLocation}>{invitation.groupLocation}</p>
          )}
        </div>

        <div className={styles.rewardBanner}>
          <span className={styles.rewardIcon}>🎁</span>
          <span className={styles.rewardText}>
            Earn <strong>+{invitation?.rpReward} Reward Points</strong> when you join!
          </span>
        </div>

        <p className={styles.intro}>
          TogetherOS is a cooperation-first platform where communities self-organize,
          share resources, and make decisions together. Join {invitation?.inviterName} and
          start building something meaningful.
        </p>

        <button onClick={handleAcceptInvitation} className={styles.button}>
          Accept Invitation & Sign Up
        </button>

        <p className={styles.disclaimer}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--brand-600)', fontWeight: 600 }}>
            Sign in
          </Link>{' '}
          to accept this invitation.
        </p>

        <p className={styles.expiryNote}>
          This invitation expires on{' '}
          {invitation?.expiresAt
            ? new Date(invitation.expiresAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })
            : 'soon'}
        </p>
      </div>
    </div>
  );
}
