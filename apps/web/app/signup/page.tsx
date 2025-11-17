'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './signup.module.css';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setErrorMessage('Email is required');
      return;
    }

    setState('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password || undefined }),
      });

      const data = await response.json();

      if (!response.ok) {
        setState('error');
        setErrorMessage(data.error || 'Something went wrong');
        return;
      }

      // Redirect to dashboard (which will redirect to onboarding if needed)
      router.push('/dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      setState('error');
      setErrorMessage('Failed to connect. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Welcome to a world of cooperation.</h1>

        <p className={styles.intro}>
          Join a community built on empowerment through collaboration—where cooperation replaces competition,
          communities solve their own problems and thrive, and your skills create real change.
        </p>

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

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Password <span className={styles.optional}>(optional for now)</span>
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Optional: set a password"
              className={styles.input}
              disabled={state === 'loading'}
            />
          </div>

          {state === 'error' && (
            <div className={styles.error}>{errorMessage}</div>
          )}

          <button
            type="submit"
            className={styles.button}
            disabled={state === 'loading'}
          >
            {state === 'loading' ? 'Creating your account...' : 'Begin'}
          </button>

          <div className={styles.divider}>
            <span>or sign up with</span>
          </div>

          <div className={styles.oauthButtons}>
            <button
              type="button"
              className={styles.oauthButton}
              onClick={() => window.location.href = '/api/auth/google'}
            >
              Google
            </button>
            <button type="button" className={styles.oauthButton} disabled>
              Facebook <span className={styles.comingSoon}>(soon)</span>
            </button>
          </div>
        </form>

        <p className={styles.disclaimer}>
          By signing up, you agree to cooperate in good faith with the community.
          No data is sold. Ever.
        </p>

        <p className={styles.disclaimer}>
          Already have an account? <Link href="/login" style={{ color: 'var(--brand-600)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
