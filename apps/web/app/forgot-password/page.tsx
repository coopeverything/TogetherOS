'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import styles from '../signup/signup.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setMessage('Email is required');
      setState('error');
      return;
    }

    setState('loading');
    setMessage('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setState('success');
        setMessage(data.message || 'Password reset link sent to your email');

        // Show dev-only info in development
        if (data.devOnly) {
          console.log('Dev Mode - Reset URL:', data.devOnly.resetUrl);
        }
      } else {
        setState('error');
        setMessage(data.error || 'Failed to send reset link');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setState('error');
      setMessage('Failed to connect. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Forgot Password?</h1>

        <p className={styles.intro}>
          Enter your email and we'll send you a link to reset your password.
        </p>

        {state !== 'success' ? (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
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
              {state === 'loading' ? 'Sending...' : 'Send Reset Link'}
            </button>

            <p className={styles.disclaimer}>
              Remember your password? <Link href="/login" style={{ color: 'var(--brand-600)', fontWeight: 600 }}>Sign in</Link>
            </p>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
            <p style={{ color: 'var(--brand-600)', fontSize: '1.125rem', marginBottom: '1rem' }}>
              {message}
            </p>
            <p style={{ color: 'var(--ink-600)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Check your email for the password reset link. It will expire in 1 hour.
            </p>
            <Link
              href="/login"
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
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
