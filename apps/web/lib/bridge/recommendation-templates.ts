/**
 * Recommendation Templates for Bridge
 * Phase 2: Static recommendation templates for different scenarios
 */

import type { RecommendationType } from '@togetheros/types';

export interface RecommendationTemplate {
  type: RecommendationType;
  template: string;
  variables: string[];
  tone: string;
  example: string;
}

/**
 * Template library for generating recommendations
 */
export const RECOMMENDATION_TEMPLATES: Record<RecommendationType, RecommendationTemplate[]> = {
  local_group: [
    {
      type: 'local_group',
      template: "I noticed you're interested in {interest}, and there's a group in {city} called '{groupName}' with {memberCount} members. Would you like to join them? You'd earn {rewardPoints} RPs for joining!",
      variables: ['interest', 'city', 'groupName', 'memberCount', 'rewardPoints'],
      tone: 'encouraging',
      example: "I noticed you're interested in housing, and there's a group in Portland called 'Housing Cooperative Formation' with 23 members. Would you like to join them? You'd earn 50 RPs for joining!",
    },
    {
      type: 'local_group',
      template: "Have you heard about '{groupName}' in {city}? They're focused on {topics}, which aligns with your interest in {userInterest}. {memberCount} people are already part of it. Want to connect with them?",
      variables: ['groupName', 'city', 'topics', 'userInterest', 'memberCount'],
      tone: 'conversational',
      example: "Have you heard about 'Portland Climate Action' in Portland? They're focused on climate, sustainability, advocacy, which aligns with your interest in climate. 34 people are already part of it. Want to connect with them?",
    },
  ],

  event: [
    {
      type: 'event',
      template: "There's an event coming up on {date} called '{eventTitle}' at {location}. It's about {topics}, which I think you'd find interesting given your focus on {userInterest}. {rsvpCount} people have already RSVP'd. Want to join them?",
      variables: ['date', 'eventTitle', 'location', 'topics', 'userInterest', 'rsvpCount'],
      tone: 'inviting',
      example: "There's an event coming up on Nov 15 called 'Housing Cooperative Formation Workshop' at Community Center. It's about housing, cooperatives, legal, which I think you'd find interesting given your focus on cooperative housing. 23 people have already RSVP'd. Want to join them?",
    },
    {
      type: 'event',
      template: "I see '{eventTitle}' is happening {date} in your area. This could be a great opportunity to connect with others interested in {topics}. Attending could earn you {rewardPoints} RPs!",
      variables: ['eventTitle', 'date', 'topics', 'rewardPoints'],
      tone: 'enthusiastic',
      example: "I see 'Community Dinner Potluck' is happening Nov 20 in your area. This could be a great opportunity to connect with others interested in community building, food. Attending could earn you 25 RPs!",
    },
  ],

  discussion: [
    {
      type: 'discussion',
      template: "There's an active discussion in '{groupName}' about '{discussionTitle}'. {participantCount} people are already talking about {topics}. Given your interest in {userInterest}, you might have valuable insights to share. Want to join the conversation?",
      variables: ['groupName', 'discussionTitle', 'participantCount', 'topics', 'userInterest'],
      tone: 'inclusive',
      example: "There's an active discussion in 'Mutual Aid Network' about 'Starting a Community Tool Library'. 8 people are already talking about tool library, sharing economy, logistics. Given your interest in mutual aid, you might have valuable insights to share. Want to join the conversation?",
    },
  ],

  activity: [
    {
      type: 'activity',
      template: "With {memberCount} members in {city}, your community is ready for '{activityName}'. This is a {difficulty} activity that takes about {timeCommitment}. {description} You could earn {rewardPoints} RPs by organizing or participating. Want to give it a try?",
      variables: ['memberCount', 'city', 'activityName', 'difficulty', 'timeCommitment', 'description', 'rewardPoints'],
      tone: 'motivating',
      example: "With 34 members in Portland, your community is ready for 'Community Dinner Series'. This is a medium activity that takes about Ongoing (monthly). Monthly potluck dinners to build relationships. You could earn 25 RPs by organizing or participating. Want to give it a try?",
    },
    {
      type: 'activity',
      template: "Based on your city's size ({memberCount} members), I'd suggest trying '{activityName}'. {description} {examples}. This could be a great next step for your community. Interested?",
      variables: ['memberCount', 'activityName', 'description', 'examples'],
      tone: 'suggestive',
      example: "Based on your city's size (34 members), I'd suggest trying 'Community Dinner Series'. Monthly potluck dinners to build relationships. Portland grew from 22 to 45 members with monthly dinners. This could be a great next step for your community. Interested?",
    },
  ],

  thematic_group: [
    {
      type: 'thematic_group',
      template: "Since you're interested in {userInterest}, you might want to join the national group '{groupName}'. It connects people across the country who share your passion. You'd earn {rewardPoints} RPs for joining!",
      variables: ['userInterest', 'groupName', 'rewardPoints'],
      tone: 'connecting',
      example: "Since you're interested in cooperative housing, you might want to join the national group 'Cooperative Housing Network'. It connects people across the country who share your passion. You'd earn 50 RPs for joining!",
    },
  ],

  social_share: [
    {
      type: 'social_share',
      template: "Would you be willing to share your experience with {projectName} on social media? It helps more people discover cooperation. I can help you draft a post, and you'll earn {rewardPoints} RPs for amplifying the message!",
      variables: ['projectName', 'rewardPoints'],
      tone: 'encouraging',
      example: "Would you be willing to share your experience with Portland Climate Action on social media? It helps more people discover cooperation. I can help you draft a post, and you'll earn 100 RPs for amplifying the message!",
    },
    {
      type: 'social_share',
      template: "Your work in {city} is inspiring! Have you thought about sharing your story on social media? It could help others in similar communities. Plus, you'd earn {rewardPoints} RPs. Want me to help you craft a post?",
      variables: ['city', 'rewardPoints'],
      tone: 'appreciative',
      example: "Your work in Portland is inspiring! Have you thought about sharing your story on social media? It could help others in similar communities. Plus, you'd earn 100 RPs. Want me to help you craft a post?",
    },
  ],
};

/**
 * Get random template for a recommendation type
 */
export function getTemplate(type: RecommendationType): RecommendationTemplate {
  const templates = RECOMMENDATION_TEMPLATES[type];
  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Fill template with variables
 */
export function fillTemplate(
  template: string,
  variables: Record<string, string | number>
): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }
  return result;
}

/**
 * Generate recommendation text from template
 */
export function generateRecommendation(
  type: RecommendationType,
  variables: Record<string, string | number>
): string {
  const template = getTemplate(type);
  return fillTemplate(template.template, variables);
}

/**
 * Get all templates for a specific type
 */
export function getTemplatesForType(type: RecommendationType): RecommendationTemplate[] {
  return RECOMMENDATION_TEMPLATES[type];
}
