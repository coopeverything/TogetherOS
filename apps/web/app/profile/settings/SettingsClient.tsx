'use client';

import { useRouter } from 'next/navigation';
import { Card, Button, Badge, Label } from '@/components/ui';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  username?: string;
  is_admin?: boolean;
}

export default function SettingsClient({ user }: { user: User }) {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Sign out failed:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-bg-0">
      <header className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-ink-900">Account Settings</h1>
            <Button variant="secondary" onClick={() => router.push('/profile')}>
              Back to Profile
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Account Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-ink-900 mb-4">Account Information</h2>
          <div className="space-y-4">
            <div>
              <Label className="text-ink-700">Email</Label>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-ink-900">{user.email}</p>
                {user.email_verified ? (
                  <Badge variant="success">Verified</Badge>
                ) : (
                  <Badge variant="warning">Not Verified</Badge>
                )}
              </div>
            </div>

            {user.name && (
              <div>
                <Label className="text-ink-700">Name</Label>
                <p className="text-ink-900 mt-1">{user.name}</p>
              </div>
            )}

            {user.username && (
              <div>
                <Label className="text-ink-700">Username</Label>
                <p className="text-ink-900 mt-1">@{user.username}</p>
              </div>
            )}

            {user.is_admin && (
              <div>
                <Label className="text-ink-700">Role</Label>
                <Badge variant="brand" className="mt-1">Admin</Badge>
              </div>
            )}
          </div>

          <div className="mt-6">
            <Link href="/profile">
              <Button variant="default">Edit Profile</Button>
            </Link>
          </div>
        </Card>

        {/* Security Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-ink-900 mb-4">Security</h2>
          <div className="space-y-4">
            <div>
              <Label className="text-ink-700">Password</Label>
              <p className="text-sm text-ink-600 mt-1">Change your password to keep your account secure</p>
              <Link href="/reset-password">
                <Button variant="secondary" className="mt-2">Change Password</Button>
              </Link>
            </div>

            {!user.email_verified && (
              <div>
                <Label className="text-ink-700">Email Verification</Label>
                <p className="text-sm text-ink-600 mt-1">Verify your email address to secure your account</p>
                <Button variant="secondary" className="mt-2">
                  Resend Verification Email
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Account Actions */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-ink-900 mb-4">Account Actions</h2>
          <div className="space-y-4">
            <div>
              <Label className="text-ink-700">Sign Out</Label>
              <p className="text-sm text-ink-600 mt-1">
                Sign out of your account on this device
              </p>
              <Button
                variant="secondary"
                onClick={handleSignOut}
                className="mt-2"
              >
                Sign Out
              </Button>
            </div>

            <div className="border-t border-border pt-4 mt-6">
              <Label className="text-red-700">Danger Zone</Label>
              <p className="text-sm text-ink-600 mt-1">
                Permanently delete your account and all associated data
              </p>
              <Button
                variant="danger"
                onClick={() => alert('Account deletion coming soon')}
                className="mt-2"
              >
                Delete Account
              </Button>
            </div>
          </div>
        </Card>

        {/* Quick Links */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-ink-900 mb-4">Quick Links</h2>
          <div className="space-y-2">
            <Link href="/dashboard" className="block text-brand-600 hover:text-brand-700">
              Dashboard →
            </Link>
            <Link href="/notifications" className="block text-brand-600 hover:text-brand-700">
              Notifications →
            </Link>
            <Link href="/groups" className="block text-brand-600 hover:text-brand-700">
              My Groups →
            </Link>
            {user.is_admin && (
              <Link href="/admin" className="block text-brand-600 hover:text-brand-700">
                Admin Panel →
              </Link>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
