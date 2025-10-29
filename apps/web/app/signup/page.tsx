'use client';

import { useState, FormEvent } from 'react';
import styles from './signup.module.css';

export default function SignupPage() {
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

      setState('success');
      // TODO: Redirect to onboarding
    } catch (error) {
      console.error('Signup error:', error);
      setState('error');
      setErrorMessage('Failed to connect. Please try again.');
    }
  };

  if (state === 'success') {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Welcome!</h1>
          <p className={styles.intro}>
            Check your email for a verification link. We'll guide you through the rest from there.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Welcome to the beginning of something different.</h1>

        <p className={styles.intro}>
          We're building a new way to organize—where cooperation replaces competition,
          where communities solve their own problems, and where your skills actually matter.
        </p>

        <p className={styles.callout}>
          <strong>Start with just your email.</strong> No essays, no commitments.
          We'll guide you through discovering which cooperation paths resonate with you,
          and connect you with people doing real work on education, local economy,
          governance, climate, and more.
        </p>

        <p className={styles.intro}>
          Whether you're here to learn, teach, build, organize, or just explore—
          <strong>there's a place for you.</strong>
        </p>

        <p className={styles.manifesto}>
          The system we have isn't working. Let's build the one that does.
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
            <button type="button" className={styles.oauthButton} disabled>
              Google <span className={styles.comingSoon}>(soon)</span>
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
      </div>
    </div>
  );
}
