'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Input, Label, Alert } from '@/components/ui';
import { RPEarnedAnimation } from '@togetheros/ui/gamification';

interface InvitationStats {
  totalSent: number;
  acceptedCount: number;
  pendingCount: number;
  totalRPEarned: number;
  sentThisWeek: number;
  weeklyLimit: number;
}

interface Invitation {
  id: string;
  inviteeEmail: string;
  status: string;
  stage: number;
  sentAt: string;
  acceptedAt?: string;
  rpEarned: number;
}

export default function InvitePageClient() {
  // Mock user ID - in production this would come from auth
  const userId = '00000000-0000-0000-0000-000000000001';

  const [stats, setStats] = useState<InvitationStats | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showSendForm, setShowSendForm] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState(false);

  const [showRPAnimation, setShowRPAnimation] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/gamification/invitations/stats?userId=${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch stats');
      }

      setStats(data.stats);
      setInvitations(data.invitations || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSendError(null);
    setSendSuccess(false);

    try {
      const response = await fetch('/api/gamification/invitations/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviterId: userId,
          inviteeEmail: email,
          groupId: 'default', // Default group
          personalMessage: message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitation');
      }

      setSendSuccess(true);
      setShowRPAnimation(true);
      setEmail('');
      setMessage('');
      fetchData(); // Refresh data

      // Hide form after success
      setTimeout(() => {
        setShowSendForm(false);
        setSendSuccess(false);
      }, 2000);
    } catch (err: any) {
      setSendError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-0 py-8 px-4">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-0 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Alert variant="danger" title="Error">
            {error}
          </Alert>
        </div>
      </div>
    );
  }

  const canSendMore = stats && stats.sentThisWeek < stats.weeklyLimit;

  return (
    <div className="min-h-screen bg-bg-0 py-8 px-4">
      {/* RP Animation */}
      {showRPAnimation && (
        <RPEarnedAnimation
          amount={25}
          label="Invitation sent!"
          onComplete={() => setShowRPAnimation(false)}
        />
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ink-900 mb-2">Invite Friends</h1>
          <p className="text-ink-700">
            Grow the community by inviting people you know. Earn RP when they join!
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 text-center">
              <p className="text-3xl font-bold text-brand-600">{stats.totalSent}</p>
              <p className="text-base text-ink-600">Total Sent</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{stats.acceptedCount}</p>
              <p className="text-base text-ink-600">Accepted</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-3xl font-bold text-yellow-600">{stats.pendingCount}</p>
              <p className="text-base text-ink-600">Pending</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-3xl font-bold text-purple-600">+{stats.totalRPEarned}</p>
              <p className="text-base text-ink-600">RP Earned</p>
            </Card>
          </div>
        )}

        {/* Weekly Limit */}
        {stats && (
          <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-brand-800">Weekly Invitations</p>
                <p className="text-base text-brand-700">
                  {stats.sentThisWeek} of {stats.weeklyLimit} used this week
                </p>
              </div>
              <div className="w-32 h-2 bg-brand-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-600"
                  style={{ width: `${(stats.sentThisWeek / stats.weeklyLimit) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Send Invitation Form */}
        {!showSendForm ? (
          <Button
            onClick={() => setShowSendForm(true)}
            disabled={!canSendMore}
            variant="default"
            className="mb-8"
          >
            {canSendMore ? '✉️ Send Invitation' : 'Weekly limit reached'}
          </Button>
        ) : (
          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-bold text-ink-900 mb-4">Send an Invitation</h2>

            {sendSuccess && (
              <Alert variant="success" title="Invitation Sent!" className="mb-4">
                You earned +25 RP! You'll earn more when they join.
              </Alert>
            )}

            {sendError && (
              <Alert variant="danger" title="Error" className="mb-4">
                {sendError}
              </Alert>
            )}

            <form onSubmit={handleSendInvitation} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="friend@example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="message">Personal Message (optional)</Label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a personal note to your invitation..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowSendForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="default" disabled={sending || !email}>
                  {sending ? 'Sending...' : 'Send Invitation (+25 RP)'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* RP Rewards Info */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-brand-50 to-purple-50">
          <h3 className="font-bold text-ink-900 mb-3">🎮 Invitation Rewards</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-3xl font-bold text-brand-600">+25 RP</p>
              <p className="text-base text-ink-600">When you send</p>
            </div>
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-3xl font-bold text-green-600">+50 RP</p>
              <p className="text-base text-ink-600">When they join</p>
            </div>
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-3xl font-bold text-purple-600">+25 RP</p>
              <p className="text-base text-ink-600">First contribution</p>
            </div>
          </div>
        </Card>

        {/* Sent Invitations */}
        <div>
          <h2 className="text-2xl font-bold text-ink-900 mb-4">Sent Invitations</h2>

          {invitations.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-4xl mb-3">✉️</p>
              <p className="text-ink-600">No invitations sent yet</p>
              <p className="text-base text-ink-500">Send your first invitation to get started!</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {invitations.map((inv) => (
                <Card key={inv.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-ink-900">{inv.inviteeEmail}</p>
                      <p className="text-base text-ink-500">
                        Sent {new Date(inv.sentAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-3 py-1.5 rounded-full text-base font-medium ${
                          inv.status === 'accepted'
                            ? 'bg-green-100 text-green-800'
                            : inv.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {inv.status === 'accepted'
                          ? '✓ Joined'
                          : inv.status === 'pending'
                          ? '⏳ Pending'
                          : inv.status}
                      </span>
                      {inv.rpEarned > 0 && (
                        <span className="text-brand-600 font-medium">
                          +{inv.rpEarned} RP
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
