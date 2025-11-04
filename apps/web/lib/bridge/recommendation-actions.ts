/**
 * Recommendation Action Handlers
 * Connects recommendations to actual user actions
 */

import type { RecommendationType } from '@togetheros/types';

export interface ActionResult {
  success: boolean;
  redirectUrl?: string;
  message?: string;
  error?: string;
}

/**
 * Execute the appropriate action based on recommendation type
 */
export async function executeRecommendationAction(
  recommendationType: RecommendationType,
  targetId: string,
  targetUrl?: string
): Promise<ActionResult> {
  switch (recommendationType) {
    case 'local_group':
    case 'thematic_group':
      return await handleGroupJoin(targetId);

    case 'event':
      return await handleEventRSVP(targetId);

    case 'discussion':
      return await handleDiscussionView(targetId);

    case 'activity':
      return await handleActivityStart(targetId);

    case 'social_share':
      return await handleSocialShare(targetId, targetUrl);

    default:
      return {
        success: false,
        error: `Unknown recommendation type: ${recommendationType}`,
      };
  }
}

/**
 * Handle joining a group
 */
async function handleGroupJoin(groupId: string): Promise<ActionResult> {
  try {
    const response = await fetch('/api/groups/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'Failed to join group',
      };
    }

    return {
      success: true,
      redirectUrl: `/groups/${groupId}`,
      message: 'Successfully joined group!',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Handle RSVP to an event
 */
async function handleEventRSVP(eventId: string): Promise<ActionResult> {
  try {
    const response = await fetch('/api/events/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, status: 'attending' }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'Failed to RSVP',
      };
    }

    return {
      success: true,
      redirectUrl: `/events/${eventId}`,
      message: 'Successfully RSVP\'d to event!',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Handle viewing a discussion
 */
async function handleDiscussionView(discussionId: string): Promise<ActionResult> {
  // No API call needed, just navigate
  return {
    success: true,
    redirectUrl: `/discussions/${discussionId}`,
  };
}

/**
 * Handle starting an activity
 */
async function handleActivityStart(activityId: string): Promise<ActionResult> {
  return {
    success: true,
    redirectUrl: `/activities/${activityId}`,
  };
}

/**
 * Handle social sharing
 */
async function handleSocialShare(shareId: string, shareUrl?: string): Promise<ActionResult> {
  if (!shareUrl) {
    return {
      success: false,
      error: 'No share URL provided',
    };
  }

  // Open share URL in new window
  if (typeof window !== 'undefined') {
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  }

  return {
    success: true,
    message: 'Opened share dialog',
  };
}

/**
 * Client-side hook for handling recommendation actions
 */
export function useRecommendationAction() {
  const handleAction = async (
    recommendationType: RecommendationType,
    recommendationId: string,
    targetId: string,
    targetUrl?: string
  ): Promise<ActionResult> => {
    // First, mark recommendation as acted on
    try {
      await fetch(`/api/bridge/recommendations/${recommendationId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'act' }),
      });
    } catch (error) {
      console.error('Failed to mark recommendation as acted on:', error);
      // Continue anyway - the action is more important
    }

    // Execute the actual action
    const result = await executeRecommendationAction(
      recommendationType,
      targetId,
      targetUrl
    );

    // Navigate if successful and redirect URL provided
    if (result.success && result.redirectUrl && typeof window !== 'undefined') {
      window.location.href = result.redirectUrl;
    }

    return result;
  };

  const handleDismiss = async (recommendationId: string): Promise<ActionResult> => {
    try {
      const response = await fetch(`/api/bridge/recommendations/${recommendationId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'dismiss' }),
      });

      if (!response.ok) {
        return {
          success: false,
          error: 'Failed to dismiss recommendation',
        };
      }

      return {
        success: true,
        message: 'Recommendation dismissed',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  };

  return { handleAction, handleDismiss };
}
