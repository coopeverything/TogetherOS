/**
 * Static Activity Recommendations by City Size
 * Phase 2: Pre-defined suggestions based on member count
 */

import type { ActivityRecommendation, ActivityByCitySize } from '@togetheros/types';

export const ACTIVITIES_BY_CITY_SIZE: ActivityByCitySize = {
  '5-15': [
    {
      name: 'Coffee Meetup',
      description: 'Informal gathering at a local cafe to get to know each other',
      difficulty: 'easy',
      rewardPoints: 10,
      timeCommitment: '2 hours',
      prerequisites: [],
      citySize: '5-15',
      examples: ['Austin started with 8 people, now has 42 members'],
    },
    {
      name: 'Skill-Share Session',
      description: 'Members teach each other skills (cooking, repair, coding, etc.)',
      difficulty: 'easy',
      rewardPoints: 15,
      timeCommitment: '3 hours',
      prerequisites: [],
      citySize: '5-15',
    },
    {
      name: 'Create Communication Channel',
      description: 'Set up WhatsApp/Signal group for coordination',
      difficulty: 'easy',
      rewardPoints: 10,
      timeCommitment: '30 minutes',
      prerequisites: [],
      citySize: '5-15',
    },
  ],
  '15-30': [
    {
      name: 'Community Dinner Series',
      description: 'Monthly potluck dinners to build relationships',
      difficulty: 'medium',
      rewardPoints: 25,
      timeCommitment: 'Ongoing (monthly)',
      prerequisites: ['venue_access'],
      citySize: '15-30',
      examples: ['Portland grew from 22 to 45 members with monthly dinners'],
    },
    {
      name: 'Start a Community Garden',
      description: 'Collective gardening project for food and connection',
      difficulty: 'medium',
      rewardPoints: 50,
      timeCommitment: 'Ongoing (seasonal)',
      prerequisites: ['land_access'],
      citySize: '15-30',
    },
    {
      name: 'Tool Library Launch',
      description: 'Share tools and equipment within the community',
      difficulty: 'medium',
      rewardPoints: 40,
      timeCommitment: 'Ongoing',
      prerequisites: ['storage_space'],
      citySize: '15-30',
    },
  ],
  '30-50': [
    {
      name: 'Timebanking System',
      description: 'Exchange skills and services using time as currency',
      difficulty: 'medium',
      rewardPoints: 75,
      timeCommitment: 'Ongoing',
      prerequisites: ['coordinator'],
      citySize: '30-50',
      examples: ['Denver timebank has 38 active members'],
    },
    {
      name: 'Housing Cooperative Formation',
      description: 'Start a co-housing or cooperative housing project',
      difficulty: 'hard',
      rewardPoints: 100,
      timeCommitment: '6-12 months',
      prerequisites: ['legal_advisor', 'capital'],
      citySize: '30-50',
    },
    {
      name: 'Community Supported Agriculture (CSA)',
      description: 'Partner with local farmers for shared food production',
      difficulty: 'medium',
      rewardPoints: 60,
      timeCommitment: 'Seasonal',
      prerequisites: ['farmer_partner'],
      citySize: '30-50',
    },
  ],
  '50-100': [
    {
      name: 'Cooperative Business',
      description: 'Launch a worker-owned business or service',
      difficulty: 'hard',
      rewardPoints: 150,
      timeCommitment: '12+ months',
      prerequisites: ['business_plan', 'capital', 'legal_structure'],
      citySize: '50-100',
      examples: ['Oakland tech co-op started with 52 members'],
    },
    {
      name: 'Community Land Trust',
      description: 'Acquire and steward land for affordable housing',
      difficulty: 'hard',
      rewardPoints: 200,
      timeCommitment: '24+ months',
      prerequisites: ['legal_entity', 'capital', 'board'],
      citySize: '50-100',
    },
    {
      name: 'Mutual Aid Network',
      description: 'Formalized system for community mutual support',
      difficulty: 'medium',
      rewardPoints: 75,
      timeCommitment: 'Ongoing',
      prerequisites: ['coordinators'],
      citySize: '50-100',
    },
  ],
  '100+': [
    {
      name: 'Cooperative Credit Union',
      description: 'Member-owned financial institution',
      difficulty: 'hard',
      rewardPoints: 300,
      timeCommitment: '24+ months',
      prerequisites: ['legal_entity', 'capital', 'board', 'regulatory_approval'],
      citySize: '100+',
      examples: ['Seattle cooperative credit union has 250+ members'],
    },
    {
      name: 'Neighborhood Council',
      description: 'Democratic governance for neighborhood decisions',
      difficulty: 'medium',
      rewardPoints: 100,
      timeCommitment: 'Ongoing',
      prerequisites: ['formal_structure'],
      citySize: '100+',
    },
    {
      name: 'Community Center',
      description: 'Physical space for meetings, events, and programs',
      difficulty: 'hard',
      rewardPoints: 250,
      timeCommitment: '18+ months',
      prerequisites: ['legal_entity', 'capital', 'property'],
      citySize: '100+',
    },
  ],
};

/**
 * Get activities for a specific city size
 */
export function getActivitiesForCitySize(memberCount: number): ActivityRecommendation[] {
  if (memberCount < 15) return ACTIVITIES_BY_CITY_SIZE['5-15'];
  if (memberCount < 30) return ACTIVITIES_BY_CITY_SIZE['15-30'];
  if (memberCount < 50) return ACTIVITIES_BY_CITY_SIZE['30-50'];
  if (memberCount < 100) return ACTIVITIES_BY_CITY_SIZE['50-100'];
  return ACTIVITIES_BY_CITY_SIZE['100+'];
}
