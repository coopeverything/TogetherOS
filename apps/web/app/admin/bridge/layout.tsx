/**
 * Admin Bridge Layout
 * Protects all /admin/bridge/* routes with admin authentication
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name?: string;
  is_admin: boolean;
}

export default function AdminBridgeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      // Check if user is authenticated and is admin
      const response = await fetch('/api/auth/me');

      if (!response.ok) {
        // Not authenticated, redirect to login
        router.push('/login?redirect=/admin/bridge');
        return;
      }

      const data = await response.json();

      if (!data.user || !data.user.is_admin) {
        // Not an admin, show forbidden message
        setUser(null);
        setIsLoading(false);
        return;
      }

      // User is admin, allow access
      setUser(data.user);
      setIsLoading(false);
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/login?redirect=/admin/bridge');
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'var(--bg-0)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '4px solid var(--border)',
              borderTopColor: 'var(--brand-600)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem',
            }}
          />
          <p style={{ color: 'var(--ink-700)' }}>Verifying admin access...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'var(--bg-0)',
          padding: '2rem',
        }}
      >
        <div
          style={{
            maxWidth: '500px',
            background: 'var(--bg-1)',
            padding: '3rem',
            borderRadius: '1rem',
            border: '1px solid var(--border)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'var(--danger-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <svg
              width="40"
              height="40"
              fill="none"
              stroke="var(--danger)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="20" cy="20" r="18" />
              <path d="M20 8v8M20 24h.01" />
            </svg>
          </div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--ink-900)',
              marginBottom: '0.5rem',
            }}
          >
            Admin Access Required
          </h1>
          <p
            style={{
              color: 'var(--ink-700)',
              lineHeight: 1.6,
              marginBottom: '2rem',
            }}
          >
            This area is restricted to platform administrators. If you believe you should have
            access, please contact your system administrator.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <a
              href="/"
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                background: 'var(--brand-600)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '0.5rem',
                fontWeight: 600,
              }}
            >
              Go to Home
            </a>
            <a
              href="/login"
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                background: 'transparent',
                color: 'var(--ink-700)',
                textDecoration: 'none',
                borderRadius: '0.5rem',
                fontWeight: 600,
                border: '1px solid var(--border)',
              }}
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  // User is admin, render children
  return <>{children}</>;
}
