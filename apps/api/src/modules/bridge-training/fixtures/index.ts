// apps/api/src/modules/bridge-training/fixtures/index.ts
// Sample training examples for development/testing

import type { BridgeTrainingExample } from '@togetheros/types'

export const sampleTrainingExamples: BridgeTrainingExample[] = [
  {
    id: 'example_1',
    question: 'How do I create a new proposal in TogetherOS?',
    questionCategory: 'governance',
    bridgeResponse:
      'To create a proposal, navigate to the Governance section and click "New Proposal". Fill in the required fields including title, description, and voting options.',
    bridgeModel: 'gpt-3.5-turbo',
    bridgeTemperature: 0.7,
    bridgeSources: [
      {
        path: 'docs/modules/governance.md',
        title: 'Governance Module Documentation',
        url: 'https://docs.togetheros.org/governance',
      },
    ],
    bridgeResponseTimeMs: 850,
    helpfulnessRating: 4,
    accuracyRating: 3,
    toneRating: 5,
    qualityScore: 80,
    idealResponse:
      'To create a proposal in TogetherOS:\n\n1. Navigate to /governance\n2. Click "Create Proposal" button\n3. Fill in:\n   - Title: Clear, concise description\n   - Full proposal text with rationale\n   - Supporting evidence/links\n   - Voting duration (default: 7 days)\n4. Submit for review\n\nProposals require 3 Support Points to create. See docs/modules/governance.md for full details.',
    idealSources: [
      {
        path: 'docs/modules/governance.md',
        title: 'Governance Module',
        url: 'https://docs.togetheros.org/governance',
      },
    ],
    idealKeywords: ['proposal', 'governance', 'voting', 'creation'],
    trainingStatus: 'approved',
    reviewedBy: 'admin_1',
    reviewedAt: new Date('2025-11-01'),
    reviewNotes: 'Good example of governance workflow',
    usedInTraining: false,
    createdBy: 'admin_1',
    createdAt: new Date('2025-10-28'),
    updatedAt: new Date('2025-11-01'),
  },
  {
    id: 'example_2',
    question: 'What is the Social Horizon currency?',
    questionCategory: 'social-economy',
    bridgeResponse:
      'Social Horizon is a local currency used within TogetherOS communities for mutual aid and time banking.',
    bridgeModel: 'gpt-3.5-turbo',
    bridgeTemperature: 0.7,
    bridgeResponseTimeMs: 620,
    helpfulnessRating: 2,
    accuracyRating: 3,
    toneRating: 4,
    qualityScore: 60,
    idealResponse:
      'Social Horizon is TogetherOS\'s time-backed currency that enables fair exchange between community members:\n\n**How it works:**\n- 1 Social Horizon = 1 hour of skilled labor\n- Earned through timebanking, mutual aid, or community contributions\n- Used to access services, skills, or goods from other members\n- Stays within local communities (not cross-community by default)\n\n**Key features:**\n- Demurrage: Gradual value decay encourages circulation\n- Cooperative treasury: Surplus redirected to community projects\n- Privacy-first: Transactions are anonymized\n\nSee docs/modules/social-economy.md for implementation details.',
    idealSources: [
      {
        path: 'docs/modules/social-economy.md',
        title: 'Social Economy Module',
        url: 'https://docs.togetheros.org/social-economy',
      },
    ],
    idealKeywords: ['social-horizon', 'currency', 'timebanking', 'mutual-aid'],
    trainingStatus: 'approved',
    reviewedBy: 'admin_1',
    reviewedAt: new Date('2025-11-02'),
    reviewNotes: 'Original response was too vague, ideal provides full context',
    usedInTraining: false,
    createdBy: 'admin_1',
    createdAt: new Date('2025-10-30'),
    updatedAt: new Date('2025-11-02'),
  },
  {
    id: 'example_3',
    question: 'How can I report a bug?',
    questionCategory: 'support',
    bridgeResponse: 'You can report bugs by emailing support@togetheros.org.',
    bridgeModel: 'gpt-3.5-turbo',
    bridgeTemperature: 0.7,
    bridgeResponseTimeMs: 450,
    trainingStatus: 'pending',
    usedInTraining: false,
    createdBy: 'admin_1',
    createdAt: new Date('2025-11-03'),
    updatedAt: new Date('2025-11-03'),
  },
]
