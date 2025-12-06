'use client';

import { useState } from 'react';

/**
 * InvitationModal Component
 *
 * Modal for inviting new members to a group with reward points tracking.
 * Based on gamification spec milestone rewards.
 *
 * Features:
 * - Email or name input for invitee
 * - Personal message field
 * - Reward points display
 * - Form validation
 * - Success/error states
 */

export interface InvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InvitationData) => Promise<void>;
  groupId: string;
  location: string;
  rewardPoints: number;
}

export interface InvitationData {
  inviteeEmail?: string;
  inviteeName?: string;
  message?: string;
  groupId: string;
}

export function InvitationModal({
  isOpen,
  onClose,
  onSubmit,
  groupId,
  location,
  rewardPoints,
}: InvitationModalProps) {
  const [inviteeEmail, setInviteeEmail] = useState('');
  const [inviteeName, setInviteeName] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Validate: need at least email or name
      if (!inviteeEmail.trim() && !inviteeName.trim()) {
        throw new Error('Please provide either an email or name');
      }

      // Validate email format if provided
      if (inviteeEmail.trim() && !isValidEmail(inviteeEmail)) {
        throw new Error('Please provide a valid email address');
      }

      await onSubmit({
        inviteeEmail: inviteeEmail.trim() || undefined,
        inviteeName: inviteeName.trim() || undefined,
        message: message.trim() || undefined,
        groupId,
      });

      // Show success state
      setSuccess(true);

      // Reset form after 2 seconds
      setTimeout(() => {
        setInviteeEmail('');
        setInviteeName('');
        setMessage('');
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Invitation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setInviteeEmail('');
      setInviteeName('');
      setMessage('');
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Invite Someone to {location}
          </h2>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {success ? (
            // Success State
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-green-100 rounded-full">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Invitation Sent!
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                You earned <span className="font-semibold text-orange-600">+{rewardPoints} RP</span>
              </p>
            </div>
          ) : (
            <>
              {/* Reward Points Banner */}
              <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⭐</span>
                  <div>
                    <p className="text-sm font-medium text-orange-900">
                      Earn {rewardPoints} Reward Points
                    </p>
                    <p className="text-xs text-orange-700">
                      When your invitee joins the group
                    </p>
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div className="mb-4">
                <label htmlFor="inviteeEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-gray-500">(optional)</span>
                </label>
                <input
                  type="email"
                  id="inviteeEmail"
                  value={inviteeEmail}
                  onChange={(e) => setInviteeEmail(e.target.value)}
                  placeholder="friend@example.com"
                  disabled={submitting}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50 dark:bg-gray-900"
                />
              </div>

              {/* Name Field */}
              <div className="mb-4">
                <label htmlFor="inviteeName" className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-gray-500">(optional if email provided)</span>
                </label>
                <input
                  type="text"
                  id="inviteeName"
                  value={inviteeName}
                  onChange={(e) => setInviteeName(e.target.value)}
                  placeholder="Alex Smith"
                  disabled={submitting}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50 dark:bg-gray-900"
                />
              </div>

              {/* Message Field */}
              <div className="mb-6">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Personal Message <span className="text-gray-500">(optional)</span>
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="I think you'd be a great fit for our community..."
                  rows={3}
                  disabled={submitting}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50 dark:bg-gray-900 resize-none"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 text-gray-700 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {submitting ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

/**
 * Simple email validation
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default InvitationModal;
