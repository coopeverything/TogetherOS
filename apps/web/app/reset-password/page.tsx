'use client';

import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../signup/signup.module.css';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const token = searchParams.get('token');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!token) {
      setMessage('Invalid reset link');
      setState('error');
      return;
    }

    if (password.length < 8) {
      setMessage('Password must be at least 8 characters');
      setState('error');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      setState('error');
      return;
    }

    setState('loading');
    setMessage('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setState('success');
        setMessage('Password reset successfully!');
        // Redirect to login after 2 seconds
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setState('error');
        setMessage(data.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setState('error');
      setMessage('Failed to connect. Please try again.');
    }
  };

  if (!token) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Invalid Reset Link</h1>
          <p style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            This password reset link is invalid or has expired.
          </p>
          <Link
            href="/forgot-password"
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--brand-600)',
              color: 'white',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Reset Password</h1>

        <p className={styles.intro}>
          Enter your new password below.
        </p>

        {state !== 'success' ? (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                New Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className={styles.input}
                disabled={state === 'loading'}
                required
                minLength={8}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className={styles.input}
                disabled={state === 'loading'}
                required
              />
            </div>

            {state === 'error' && (
              <div className={styles.error}>{message}</div>
            )}

            <button
              type="submit"
              className={styles.button}
              disabled={state === 'loading'}
            >
              {state === 'loading' ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
            <p style={{ color: 'var(--brand-600)', fontSize: '1.125rem', marginBottom: '1rem' }}>
              {message}
            </p>
            <p style={{ color: 'var(--ink-600)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Redirecting to login...
            </p>
            <Link
              href="/login"
              style={{
                color: 'var(--brand-600)',
                textDecoration: 'underline',
              }}
            >
              Go to Login now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
