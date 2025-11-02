/**
 * Milestone type definitions for group growth tracking
 * Based on gamification spec (docs/modules/gamification.md lines 300-310)
 */

export interface Milestone {
  id: string;
  threshold: number;
  label: string;
  celebration: string;
  unlocks: string[];
  actionNudge?: {
    text: string;
    reward: number; // Reward Points (RP)
  };
}

export interface MilestoneAchievement {
  milestoneId: string;
  achievedAt: Date;
  memberCountAtAchievement: number;
}

export interface GroupGrowthData {
  groupId: string;
  currentMemberCount: number;
  recentGrowth: number;
  location: string;
  achievedMilestones: MilestoneAchievement[];
}
