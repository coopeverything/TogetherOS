// apps/api/src/services/bridge/index.ts
// Barrel export for Bridge intelligence services
//
// Note: Only client-safe services are exported here
// Server-only services (OnboardingService, SimilarityDetector) must be imported directly
// to avoid bundling server dependencies (pg, etc.) into client bundles

export { TopicIntelligence, AVAILABLE_TOPICS } from './TopicIntelligence'
export type { TopicSuggestion, SimilarPost, SimilarThread } from './TopicIntelligence'
