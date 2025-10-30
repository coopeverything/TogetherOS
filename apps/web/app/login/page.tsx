'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../signup/signup.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      setErrorMessage('Email and password are required');
      return;
    }

    setState('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setState('error');
        setErrorMessage(data.error || 'Failed to login');
        return;
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setState('error');
      setErrorMessage('Failed to connect. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Welcome back</h1>

        <p className={styles.intro}>
          Sign in to continue your cooperation journey.
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
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className={styles.input}
              disabled={state === 'loading'}
              required
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
            {state === 'loading' ? 'Signing in...' : 'Sign In'}
          </button>

          <div className={styles.divider}>
            <span>or sign in with</span>
          </div>

          <div className={styles.oauthButtons}>
            <button type="button" className={styles.oauthButton} disabled>
              Google <span className={styles.comingSoon}>(soon)</span>
            </button>
            <button type="button" className={styles.oauthButton} disabled>
              Facebook <span className={styles.comingSoon}>(soon)</span>
            </button>
          </div>
        </form>

        <p className={styles.disclaimer}>
          Don't have an account? <Link href="/signup" style={{ color: 'var(--brand-600)', fontWeight: 600 }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
