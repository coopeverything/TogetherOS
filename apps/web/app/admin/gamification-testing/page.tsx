'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  RPEarnedAnimation,
  RPProgressBar,
  DailyChallengeCard,
} from '@togetheros/ui/gamification';
import {
  GroupGrowthTracker,
  InviteButton,
  InviteStats,
  InvitationModal,
} from '@togetheros/ui/groups';
import { MilestoneCelebration } from '@togetheros/ui/milestones';
import type { InvitationStats, ChallengeDefinition, PendingCelebration } from '@togetheros/types';
import { MILESTONES } from '@togetheros/types';

// Sample data for testing
const SAMPLE_INVITATION_STATS: InvitationStats = {
  totalSent: 12,
  totalAccepted: 8,
  totalContributed: 5,
  qualityScore: 0.65,
  sentThisWeek: 3,
  weeklyLimit: 5,
};

const SAMPLE_CHALLENGE: ChallengeDefinition = {
  id: 'sample-1',
  name: 'Welcome to the Community',
  description: 'Introduce yourself in the group chat and share one thing you hope to accomplish.',
  category: 'social',
  difficulty: 'easy',
  rpReward: 25,
  icon: 'wave',
  isFirstWeek: true,
  dayNumber: 1,
  actionType: 'post_message',
  actionTarget: { count: 1 },
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const SAMPLE_CELEBRATION: PendingCelebration = {
  milestoneId: 'test-milestone',
  milestone: MILESTONES[1], // 15 members
  groupId: 'test-group',
  groupName: 'Test Community',
  achievedAt: new Date(),
  memberCount: 15,
};

export default function GamificationTestPage() {
  const [showRPAnimation, setShowRPAnimation] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [rpAmount, setRpAmount] = useState(50);
  const [currentRP, setCurrentRP] = useState(350);

  return (
    <div className="min-h-screen bg-bg-1 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <Link href="/admin" className="text-sm text-ink-400 hover:text-ink-700 mb-2 inline-block">
              ← Back to Admin
            </Link>
            <h1 className="text-sm font-bold text-ink-900">Gamification Testing</h1>
            <p className="text-ink-700 mt-1">
              Test all gamification components in one place
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-ink-400">Module Progress</div>
            <div className="text-sm font-bold text-brand-600">100%</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* RP Animations Section */}
          <div className="bg-bg-0 rounded-xl border border-border p-4">
            <h2 className="text-sm font-semibold text-ink-900 mb-4">RP Animations</h2>

            <div className="space-y-2">
              <div>
                <label className="block text-sm text-ink-700 mb-2">RP Amount</label>
                <input
                  type="number"
                  value={rpAmount}
                  onChange={(e) => setRpAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-lg"
                />
              </div>

              <button
                onClick={() => {
                  setShowRPAnimation(true);
                  setCurrentRP(prev => prev + rpAmount);
                }}
                className="w-full px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
              >
                Trigger RP Earned Animation
              </button>

              <div className="mt-4">
                <RPProgressBar
                  current={currentRP}
                  max={500}
                />
              </div>
            </div>

            {showRPAnimation && (
              <RPEarnedAnimation
                amount={rpAmount}
                label="Test Reward"
                onComplete={() => setShowRPAnimation(false)}
              />
            )}
          </div>

          {/* Milestone Celebration Section */}
          <div className="bg-bg-0 rounded-xl border border-border p-4">
            <h2 className="text-sm font-semibold text-ink-900 mb-4">Milestone Celebration</h2>

            <button
              onClick={() => setShowCelebration(true)}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Trigger 15 Members Celebration
            </button>

            <p className="text-sm text-ink-400 mt-4">
              Celebrations can be skipped with ESC or the skip button.
              Respects prefers-reduced-motion.
            </p>

            {showCelebration && (
              <MilestoneCelebration
                celebration={SAMPLE_CELEBRATION}
                onComplete={() => setShowCelebration(false)}
              />
            )}
          </div>

          {/* Invitation Components Section */}
          <div className="bg-bg-0 rounded-xl border border-border p-4">
            <h2 className="text-sm font-semibold text-ink-900 mb-4">Invitation Components</h2>

            <div className="space-y-2">
              <div>
                <h3 className="text-sm font-medium text-ink-700 mb-2">InviteButton Variants</h3>
                <div className="flex flex-wrap gap-2">
                  <InviteButton
                    groupId="test"
                    groupName="Test Group"
                    variant="primary"
                    remainingInvites={3}
                    onInviteClick={() => setShowInviteModal(true)}
                  />
                  <InviteButton
                    groupId="test"
                    groupName="Test Group"
                    variant="secondary"
                    onInviteClick={() => setShowInviteModal(true)}
                  />
                  <InviteButton
                    groupId="test"
                    groupName="Test Group"
                    variant="outline"
                    onInviteClick={() => setShowInviteModal(true)}
                  />
                  <InviteButton
                    groupId="test"
                    groupName="Test Group"
                    disabled
                    remainingInvites={0}
                  />
                </div>
              </div>

              <InviteStats stats={SAMPLE_INVITATION_STATS} />
            </div>

            {showInviteModal && (
              <InvitationModal
                isOpen={showInviteModal}
                groupId="test-group"
                location="Local Test Area"
                rewardPoints={100}
                onClose={() => setShowInviteModal(false)}
                onSubmit={async () => {
                  setShowInviteModal(false);
                  alert('Invitation sent!');
                }}
              />
            )}
          </div>

          {/* Growth Tracker Section */}
          <div className="bg-bg-0 rounded-xl border border-border p-4">
            <h2 className="text-sm font-semibold text-ink-900 mb-4">Group Growth Tracker</h2>

            <GroupGrowthTracker
              groupId="test-group"
              currentMemberCount={12}
              location="Local Test Area"
            />
          </div>

          {/* Daily Challenge Card Section */}
          <div className="bg-bg-0 rounded-xl border border-border p-4 lg:col-span-2">
            <h2 className="text-sm font-semibold text-ink-900 mb-4">Daily Challenge Cards</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Pending Challenge */}
              <DailyChallengeCard
                challenge={SAMPLE_CHALLENGE}
                streak={5}
                onComplete={async () => {
                  alert('Challenge completed!');
                }}
              />

              {/* Completed Challenge */}
              <DailyChallengeCard
                challenge={{
                  ...SAMPLE_CHALLENGE,
                  id: 'sample-2',
                  name: 'Explore the Platform',
                  description: 'Visit 3 different sections of TogetherOS.',
                  icon: 'compass',
                  dayNumber: 2,
                } as ChallengeDefinition}
                userChallenge={{
                  id: 'uc-1',
                  userId: 'test',
                  challengeId: 'sample-2',
                  assignedDate: new Date(),
                  status: 'completed',
                  completedAt: new Date(),
                  progress: {},
                  rpAwarded: 30,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                }}
                streak={5}
              />

              {/* Locked Challenge */}
              <DailyChallengeCard
                challenge={{
                  ...SAMPLE_CHALLENGE,
                  id: 'sample-3',
                  name: 'Invite a Friend',
                  description: 'Send your first invitation to someone in your local area.',
                  icon: 'mail',
                  dayNumber: 5,
                  rpReward: 50,
                } as ChallengeDefinition}
                isLocked
                unlockDay={5}
              />
            </div>
          </div>

          {/* First Week Journey Section */}
          <div className="bg-bg-0 rounded-xl border border-border p-4 lg:col-span-2">
            <h2 className="text-sm font-semibold text-ink-900 mb-4">First Week Journey</h2>
            <p className="text-sm text-ink-400 mb-4">
              Note: This component fetches real data from the API. Use sample user ID below:
            </p>

            <div className="bg-bg-2 rounded-lg p-4">
              <code className="text-sm">userId: &quot;sample-user-123&quot;</code>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                FirstWeekJourney component requires API endpoints.
                Visit /onboarding to see it in action with real data.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Summary */}
        <div className="mt-4 bg-bg-0 rounded-xl border border-border p-4">
          <h2 className="text-sm font-semibold text-ink-900 mb-4">Gamification Module Features</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-800">Phase 1: Foundation</h3>
              <ul className="mt-2 text-sm text-green-700 space-y-1">
                <li>✓ Database schema</li>
                <li>✓ Type definitions</li>
                <li>✓ DB operations</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-800">Phase 2: Progress</h3>
              <ul className="mt-2 text-sm text-green-700 space-y-1">
                <li>✓ GroupGrowthTracker</li>
                <li>✓ Milestone detection</li>
                <li>✓ RPProgressBar</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-800">Phase 3: Celebrations</h3>
              <ul className="mt-2 text-sm text-green-700 space-y-1">
                <li>✓ MilestoneCelebration</li>
                <li>✓ RPEarnedAnimation</li>
                <li>✓ CelebrationProvider</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-800">Phase 4: Invitations</h3>
              <ul className="mt-2 text-sm text-green-700 space-y-1">
                <li>✓ InvitationModal</li>
                <li>✓ InviteButton</li>
                <li>✓ InviteStats</li>
                <li>✓ Daily Challenges</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
