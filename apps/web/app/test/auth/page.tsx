'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TestResult {
  status: 'pending' | 'pass' | 'fail';
  message?: string;
  data?: any;
}

export default function AuthTestPage() {
  const [sessionStatus, setSessionStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const [user, setUser] = useState<any>(null);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({
    signup: { status: 'pending' },
    login: { status: 'pending' },
    profile: { status: 'pending' },
    emailVerification: { status: 'pending' },
    passwordReset: { status: 'pending' },
    googleOAuth: { status: 'pending' },
  });

  // Test forms state
  const [signupEmail, setSignupEmail] = useState('test@example.com');
  const [signupPassword, setSignupPassword] = useState('TestPassword123');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [devUrls, setDevUrls] = useState<{ verification?: string; reset?: string }>({});

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setSessionStatus('authenticated');
        setUser(data.user);
      } else {
        setSessionStatus('unauthenticated');
      }
    } catch {
      setSessionStatus('unauthenticated');
    }
  };

  const updateTestResult = (testName: string, result: TestResult) => {
    setTestResults((prev) => ({ ...prev, [testName]: result }));
  };

  const testSignup = async () => {
    updateTestResult('signup', { status: 'pending', message: 'Creating account...' });
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signupEmail, password: signupPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        updateTestResult('signup', {
          status: 'pass',
          message: 'Account created successfully',
          data: data.user,
        });
        await checkSession();
      } else {
        updateTestResult('signup', {
          status: 'fail',
          message: data.error || 'Signup failed',
        });
      }
    } catch (error) {
      updateTestResult('signup', {
        status: 'fail',
        message: 'Network error: ' + (error as Error).message,
      });
    }
  };

  const testLogin = async () => {
    updateTestResult('login', { status: 'pending', message: 'Logging in...' });
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        updateTestResult('login', {
          status: 'pass',
          message: 'Login successful',
          data: data.user,
        });
        await checkSession();
      } else {
        updateTestResult('login', {
          status: 'fail',
          message: data.error || 'Login failed',
        });
      }
    } catch (error) {
      updateTestResult('login', {
        status: 'fail',
        message: 'Network error: ' + (error as Error).message,
      });
    }
  };

  const testLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setSessionStatus('unauthenticated');
      setUser(null);
      alert('Logged out successfully');
    } catch (error) {
      alert('Logout failed');
    }
  };

  const testProfileRead = async () => {
    updateTestResult('profile', { status: 'pending', message: 'Reading profile...' });
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();

      if (res.ok) {
        updateTestResult('profile', {
          status: 'pass',
          message: 'Profile read successfully',
          data: data.user,
        });
      } else {
        updateTestResult('profile', {
          status: 'fail',
          message: data.error || 'Profile read failed',
        });
      }
    } catch (error) {
      updateTestResult('profile', {
        status: 'fail',
        message: 'Network error',
      });
    }
  };

  const testResendVerification = async () => {
    updateTestResult('emailVerification', { status: 'pending', message: 'Sending verification...' });
    try {
      const res = await fetch('/api/auth/resend-verification', { method: 'POST' });
      const data = await res.json();

      if (res.ok) {
        updateTestResult('emailVerification', {
          status: 'pass',
          message: 'Verification email sent',
          data: data.devOnly,
        });

        if (data.devOnly?.verificationUrl) {
          setDevUrls((prev) => ({ ...prev, verification: data.devOnly.verificationUrl }));
        }
      } else {
        updateTestResult('emailVerification', {
          status: 'fail',
          message: data.error || 'Failed to send verification',
        });
      }
    } catch (error) {
      updateTestResult('emailVerification', {
        status: 'fail',
        message: 'Network error',
      });
    }
  };

  const testForgotPassword = async () => {
    updateTestResult('passwordReset', { status: 'pending', message: 'Requesting reset...' });
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        updateTestResult('passwordReset', {
          status: 'pass',
          message: 'Reset email sent',
          data: data.devOnly,
        });

        if (data.devOnly?.resetUrl) {
          setDevUrls((prev) => ({ ...prev, reset: data.devOnly.resetUrl }));
        }
      } else {
        updateTestResult('passwordReset', {
          status: 'fail',
          message: data.error || 'Failed to send reset',
        });
      }
    } catch (error) {
      updateTestResult('passwordReset', {
        status: 'fail',
        message: 'Network error',
      });
    }
  };

  const getStatusColor = (status: 'pending' | 'pass' | 'fail') => {
    switch (status) {
      case 'pass':
        return '#059669';
      case 'fail':
        return '#dc2626';
      case 'pending':
        return '#94a3b8';
    }
  };

  const getStatusSymbol = (status: 'pending' | 'pass' | 'fail') => {
    switch (status) {
      case 'pass':
        return '✓';
      case 'fail':
        return '✗';
      case 'pending':
        return '○';
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      padding: '2rem',
      backgroundColor: '#FAFAF9',
    },
    maxWidth: {
      maxWidth: '1400px',
      margin: '0 auto',
    },
    header: {
      marginBottom: '2rem',
      paddingBottom: '1rem',
      borderBottom: '2px solid #059669',
    },
    title: {
      fontSize: '2rem',
      fontWeight: 700,
      marginBottom: '0.5rem',
      color: '#0F172A',
    },
    subtitle: {
      color: '#475569',
    },
    card: {
      padding: '1.5rem',
      backgroundColor: 'white',
      border: '1px solid #E5E7EB',
      borderRadius: '0.5rem',
      marginBottom: '2rem',
    },
    sectionTitle: {
      fontSize: '1.25rem',
      fontWeight: 600,
      marginBottom: '1rem',
      color: '#0F172A',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1rem',
    },
    button: {
      padding: '0.75rem 1.5rem',
      backgroundColor: '#059669',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: '0.875rem',
    },
    buttonSecondary: {
      padding: '0.5rem 1rem',
      backgroundColor: '#334155',
      color: 'white',
      border: 'none',
      borderRadius: '0.25rem',
      cursor: 'pointer',
      fontSize: '0.875rem',
    },
    buttonDanger: {
      padding: '0.5rem 1rem',
      backgroundColor: '#dc2626',
      color: 'white',
      border: 'none',
      borderRadius: '0.25rem',
      cursor: 'pointer',
      fontSize: '0.875rem',
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #E5E7EB',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      marginBottom: '0.5rem',
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: 500,
      marginBottom: '0.25rem',
      color: '#334155',
    },
    testBox: {
      padding: '1rem',
      border: '1px solid #E5E7EB',
      borderRadius: '0.5rem',
      marginBottom: '1rem',
    },
    code: {
      padding: '1rem',
      backgroundColor: '#F5F5F4',
      borderRadius: '0.5rem',
      fontFamily: 'monospace',
      fontSize: '0.875rem',
      overflowX: 'auto' as const,
      marginTop: '0.5rem',
    },
    badge: {
      display: 'inline-block',
      padding: '0.25rem 0.75rem',
      borderRadius: '999px',
      fontSize: '0.75rem',
      fontWeight: 600,
    },
    badgeSuccess: {
      backgroundColor: '#D1FAE5',
      color: '#059669',
    },
    badgeWarning: {
      backgroundColor: '#FEF3C7',
      color: '#D97706',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.maxWidth}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>🔐 Auth Module Test Page</h1>
          <p style={styles.subtitle}>
            Interactive testing interface for all authentication features
          </p>
        </div>

        {/* Session Status */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Session Status</h2>
          <div style={{
            padding: '1rem',
            backgroundColor: sessionStatus === 'authenticated' ? '#D1FAE5' : '#FEF3C7',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <strong>Status:</strong>
              {sessionStatus === 'checking' && '⏳ Checking...'}
              {sessionStatus === 'authenticated' && '✅ Authenticated'}
              {sessionStatus === 'unauthenticated' && '⚠️ Not authenticated'}
            </div>
            {user && (
              <>
                <div><strong>Email:</strong> {user.email}</div>
                <div><strong>Name:</strong> {user.name || '(not set)'}</div>
                <div><strong>Email Verified:</strong> {user.email_verified ? '✓ Yes' : '✗ No'}</div>
                <div><strong>User ID:</strong> {user.id}</div>
              </>
            )}
          </div>

          {user && (
            <>
              <details style={{ marginBottom: '1rem' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: '0.5rem' }}>
                  View Full User Object
                </summary>
                <pre style={styles.code}>
                  {JSON.stringify(user, null, 2)}
                </pre>
              </details>

              <button onClick={testLogout} style={styles.buttonDanger}>
                Logout
              </button>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Quick Navigation</h2>
          <div style={styles.grid}>
            <Link
              href="/signup"
              style={{
                display: 'block',
                padding: '1rem',
                backgroundColor: '#059669',
                color: 'white',
                borderRadius: '0.5rem',
                textAlign: 'center',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              📝 Sign Up Page
            </Link>
            <Link
              href="/login"
              style={{
                display: 'block',
                padding: '1rem',
                backgroundColor: '#059669',
                color: 'white',
                borderRadius: '0.5rem',
                textAlign: 'center',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              🔑 Login Page
            </Link>
            <Link
              href="/profile"
              style={{
                display: 'block',
                padding: '1rem',
                backgroundColor: '#059669',
                color: 'white',
                borderRadius: '0.5rem',
                textAlign: 'center',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              👤 Profile Page
            </Link>
            <Link
              href="/forgot-password"
              style={{
                display: 'block',
                padding: '1rem',
                backgroundColor: '#334155',
                color: 'white',
                borderRadius: '0.5rem',
                textAlign: 'center',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              🔄 Forgot Password
            </Link>
          </div>
        </div>

        {/* Interactive Tests */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Interactive API Tests</h2>

          {/* Signup Test */}
          <div style={styles.testBox}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ color: getStatusColor(testResults.signup.status), fontSize: '1.5rem' }}>
                {getStatusSymbol(testResults.signup.status)}
              </span>
              <strong>1. Email/Password Signup</strong>
            </div>

            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              placeholder="test@example.com"
              style={styles.input}
            />

            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              placeholder="Min 8 characters"
              style={styles.input}
            />

            <button onClick={testSignup} style={styles.button}>
              Test Signup
            </button>

            {testResults.signup.message && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#475569' }}>
                {testResults.signup.message}
              </div>
            )}

            {testResults.signup.data && (
              <pre style={styles.code}>
                {JSON.stringify(testResults.signup.data, null, 2)}
              </pre>
            )}
          </div>

          {/* Login Test */}
          <div style={styles.testBox}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ color: getStatusColor(testResults.login.status), fontSize: '1.5rem' }}>
                {getStatusSymbol(testResults.login.status)}
              </span>
              <strong>2. Email/Password Login</strong>
            </div>

            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="your@email.com"
              style={styles.input}
            />

            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Your password"
              style={styles.input}
            />

            <button onClick={testLogin} style={styles.button}>
              Test Login
            </button>

            {testResults.login.message && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#475569' }}>
                {testResults.login.message}
              </div>
            )}
          </div>

          {/* Profile Read Test */}
          <div style={styles.testBox}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ color: getStatusColor(testResults.profile.status), fontSize: '1.5rem' }}>
                {getStatusSymbol(testResults.profile.status)}
              </span>
              <strong>3. Profile Read</strong>
            </div>

            <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '1rem' }}>
              Test fetching current user profile (requires authentication)
            </p>

            <button onClick={testProfileRead} style={styles.button}>
              Test Profile Read
            </button>

            {testResults.profile.message && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#475569' }}>
                {testResults.profile.message}
              </div>
            )}

            {testResults.profile.data && (
              <pre style={styles.code}>
                {JSON.stringify(testResults.profile.data, null, 2)}
              </pre>
            )}
          </div>

          {/* Email Verification Test */}
          <div style={styles.testBox}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ color: getStatusColor(testResults.emailVerification.status), fontSize: '1.5rem' }}>
                {getStatusSymbol(testResults.emailVerification.status)}
              </span>
              <strong>4. Email Verification</strong>
            </div>

            <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '1rem' }}>
              Test email verification flow (requires authentication)
            </p>

            <button onClick={testResendVerification} style={styles.button}>
              Send Verification Email
            </button>

            {testResults.emailVerification.message && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#475569' }}>
                {testResults.emailVerification.message}
              </div>
            )}

            {devUrls.verification && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ ...styles.badge, ...styles.badgeWarning, marginBottom: '0.5rem' }}>
                  DEV MODE
                </div>
                <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  Verification URL (click to verify):
                </p>
                <a
                  href={devUrls.verification}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    padding: '0.5rem',
                    backgroundColor: '#F5F5F4',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    wordBreak: 'break-all',
                    color: '#059669',
                    textDecoration: 'underline',
                  }}
                >
                  {devUrls.verification}
                </a>
              </div>
            )}
          </div>

          {/* Password Reset Test */}
          <div style={styles.testBox}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ color: getStatusColor(testResults.passwordReset.status), fontSize: '1.5rem' }}>
                {getStatusSymbol(testResults.passwordReset.status)}
              </span>
              <strong>5. Password Reset</strong>
            </div>

            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="email@example.com"
              style={styles.input}
            />

            <button onClick={testForgotPassword} style={styles.button}>
              Send Reset Email
            </button>

            {testResults.passwordReset.message && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#475569' }}>
                {testResults.passwordReset.message}
              </div>
            )}

            {devUrls.reset && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ ...styles.badge, ...styles.badgeWarning, marginBottom: '0.5rem' }}>
                  DEV MODE
                </div>
                <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  Reset URL (click to reset password):
                </p>
                <a
                  href={devUrls.reset}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    padding: '0.5rem',
                    backgroundColor: '#F5F5F4',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    wordBreak: 'break-all',
                    color: '#059669',
                    textDecoration: 'underline',
                  }}
                >
                  {devUrls.reset}
                </a>
              </div>
            )}
          </div>

          {/* Google OAuth Test */}
          <div style={styles.testBox}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ color: getStatusColor(testResults.googleOAuth.status), fontSize: '1.5rem' }}>
                {getStatusSymbol(testResults.googleOAuth.status)}
              </span>
              <strong>6. Google OAuth</strong>
            </div>

            <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '1rem' }}>
              Test Google OAuth 2.0 login flow. Requires environment variables.
            </p>

            <div style={{ marginBottom: '1rem', fontSize: '0.75rem', color: '#64748b' }}>
              Required env vars: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI
            </div>

            <button
              onClick={() => window.location.href = '/api/auth/google'}
              style={styles.button}
            >
              Test Google OAuth
            </button>
          </div>
        </div>

        {/* Implementation Checklist */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>✅ Implementation Checklist</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {[
              'Email/password signup',
              'Email/password login',
              'Session management (JWT, 7-day expiry)',
              'Protected routes middleware',
              'Profile CRUD operations',
              'Onboarding flow',
              'Email verification (with tokens)',
              'Password reset flow',
              'Google OAuth provider',
              'Database schema with verification_tokens table',
              'OAuth fields in User type',
              'Test page at /test/auth',
            ].map((item, i) => (
              <li key={i} style={{
                padding: '0.75rem',
                borderBottom: '1px solid #E5E7EB',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <span style={{ color: '#059669', fontSize: '1.25rem' }}>✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* API Endpoints */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>📡 API Endpoints</h2>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {[
              { method: 'POST', path: '/api/auth/signup', desc: 'Create account' },
              { method: 'POST', path: '/api/auth/login', desc: 'Authenticate user' },
              { method: 'POST', path: '/api/auth/logout', desc: 'Terminate session' },
              { method: 'GET', path: '/api/auth/verify-email?token=...', desc: 'Verify email' },
              { method: 'POST', path: '/api/auth/resend-verification', desc: 'Resend verification' },
              { method: 'POST', path: '/api/auth/forgot-password', desc: 'Request password reset' },
              { method: 'POST', path: '/api/auth/reset-password', desc: 'Reset password' },
              { method: 'GET', path: '/api/auth/google', desc: 'Initiate Google OAuth' },
              { method: 'GET', path: '/api/auth/callback/google', desc: 'Google OAuth callback' },
              { method: 'GET', path: '/api/profile', desc: 'Get current user' },
              { method: 'PATCH', path: '/api/profile', desc: 'Update profile' },
            ].map((endpoint, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem',
                backgroundColor: '#F5F5F4',
                borderRadius: '0.25rem',
                fontSize: '0.875rem',
              }}>
                <span style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: endpoint.method === 'GET' ? '#3b82f6' : '#059669',
                  color: 'white',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  minWidth: '50px',
                  textAlign: 'center',
                }}>
                  {endpoint.method}
                </span>
                <code style={{ flex: 1, color: '#0F172A' }}>{endpoint.path}</code>
                <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{endpoint.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Back Link */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link href="/dashboard" style={{ color: '#059669', textDecoration: 'underline', fontSize: '0.875rem' }}>
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
