/**
 * Badge database operations
 * Handles badge definitions and member badge awards
 */
import type { Badge, MemberBadge } from '@togetheros/types/rewards';
/**
 * Get all badge definitions
 */
export declare function getAllBadges(): Promise<Badge[]>;
/**
 * Get a single badge by ID
 */
export declare function getBadgeById(badgeId: string): Promise<Badge | null>;
/**
 * Get all badges earned by a member
 */
export declare function getMemberBadges(memberId: string): Promise<MemberBadge[]>;
/**
 * Check if a member has a specific badge
 */
export declare function memberHasBadge(memberId: string, badgeId: string): Promise<boolean>;
/**
 * Award a badge to a member
 * Returns false if member already has the badge
 */
export declare function awardBadge(memberId: string, badgeId: string, eventId?: string): Promise<{
    success: boolean;
    alreadyHad: boolean;
}>;
/**
 * Get badges with member's earned status
 */
export declare function getBadgesWithMemberStatus(memberId: string): Promise<{
    badge: Badge;
    earned: boolean;
    earnedAt?: Date;
}[]>;
/**
 * Count members who have earned a specific badge
 */
export declare function countBadgeHolders(badgeId: string): Promise<number>;
/**
 * Get recent badge awards (for admin panel)
 */
export declare function getRecentBadgeAwards(limit?: number): Promise<(MemberBadge & {
    badgeName: string;
    badgeIcon: string;
})[]>;
/**
 * Get badge statistics for admin panel
 */
export declare function getBadgeStats(): Promise<{
    totalBadges: number;
    totalAwarded: number;
    byCategory: Record<string, number>;
    topBadges: {
        badgeId: string;
        name: string;
        count: number;
    }[];
}>;
//# sourceMappingURL=badges.d.ts.map