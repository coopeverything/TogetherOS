/**
 * Support Points database operations
 * Handles SP wallet management, allocations, and reward events
 */
import type { MemberRewardBalance, RewardEvent, CreateRewardEventInput } from '@togetheros/types/rewards';
export interface SupportPointsBalance {
    member_id: string;
    total_earned: number;
    available: number;
    allocated: number;
    created_at: Date;
    updated_at: Date;
}
export interface SupportPointsTransaction {
    id: string;
    member_id: string;
    type: 'initial' | 'earn' | 'allocate' | 'reclaim' | 'expire';
    amount: number;
    target_type?: string;
    target_id?: string;
    event_id?: string;
    reason?: string;
    created_at: Date;
}
export interface SupportPointsAllocation {
    id: string;
    member_id: string;
    target_type: string;
    target_id: string;
    amount: number;
    status: 'active' | 'reclaimed' | 'expired';
    allocated_at: Date;
    reclaimed_at?: Date;
}
/**
 * Get member's Support Points balance
 */
export declare function getSupportPointsBalance(memberId: string): Promise<MemberRewardBalance | null>;
/**
 * Initialize Support Points balance for a new user
 */
export declare function initializeSupportPointsBalance(memberId: string): Promise<MemberRewardBalance>;
/**
 * Allocate Support Points to a proposal/initiative
 */
export declare function allocateSupportPoints(memberId: string, targetType: string, targetId: string, amount: number): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Reclaim Support Points from a closed/cancelled proposal
 */
export declare function reclaimSupportPoints(memberId: string, targetType: string, targetId: string): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Award Support Points from a reward event
 */
export declare function awardSupportPoints(memberId: string, amount: number, eventId?: string, reason?: string): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Get Support Points transaction history for a member
 */
export declare function getSupportPointsTransactions(memberId: string, limit?: number): Promise<SupportPointsTransaction[]>;
/**
 * Get active Support Points allocations for a member
 */
export declare function getSupportPointsAllocations(memberId: string): Promise<SupportPointsAllocation[]>;
/**
 * Get all allocations for a specific target (proposal/initiative)
 */
export declare function getTargetAllocations(targetType: string, targetId: string): Promise<{
    total: number;
    count: number;
    allocations: SupportPointsAllocation[];
}>;
/**
 * Create a reward event
 */
export declare function createRewardEvent(input: CreateRewardEventInput): Promise<RewardEvent>;
/**
 * Process a pending reward event (award SP and mark as processed)
 */
export declare function processRewardEvent(eventId: string): Promise<{
    success: boolean;
    error?: string;
}>;
//# sourceMappingURL=support-points.d.ts.map