'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setState('error');
      setMessage('No verification token provided');
      return;
    }

    // Verify the token
    fetch(`/api/auth/verify-email?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setState('success');
          setMessage('Email verified successfully!');
          // Redirect to dashboard after 3 seconds
          setTimeout(() => router.push('/dashboard'), 3000);
        } else {
          setState('error');
          setMessage(data.error || 'Verification failed');
        }
      })
      .catch((error) => {
        console.error('Verification error:', error);
        setState('error');
        setMessage('Failed to verify email');
      });
  }, [searchParams, router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      backgroundColor: 'var(--bg-0)',
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        padding: '3rem',
        backgroundColor: 'var(--bg-1)',
        borderRadius: '1rem',
        border: '1px solid var(--border)',
        textAlign: 'center',
      }}>
        {state === 'verifying' && (
          <>
            <h1 style={{ marginBottom: '1rem' }}>Verifying your email...</h1>
            <p style={{ color: 'var(--ink-600)' }}>Please wait</p>
          </>
        )}

        {state === 'success' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
            <h1 style={{ marginBottom: '1rem', color: 'var(--brand-600)' }}>Email Verified!</h1>
            <p style={{ color: 'var(--ink-600)', marginBottom: '1.5rem' }}>
              {message}
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-500)' }}>
              Redirecting to dashboard...
            </p>
            <Link
              href="/dashboard"
              style={{
                display: 'inline-block',
                marginTop: '1rem',
                color: 'var(--brand-600)',
                textDecoration: 'underline',
              }}
            >
              Go to Dashboard now
            </Link>
          </>
        )}

        {state === 'error' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✗</div>
            <h1 style={{ marginBottom: '1rem', color: 'var(--error)' }}>Verification Failed</h1>
            <p style={{ color: 'var(--ink-600)', marginBottom: '1.5rem' }}>
              {message}
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-500)', marginBottom: '1rem' }}>
              The link may have expired or already been used.
            </p>
            <Link
              href="/dashboard"
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--brand-600)',
                color: 'white',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Go to Dashboard
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
