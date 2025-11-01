// apps/web/app/api/status/route.ts
import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

interface Module {
  key: string;
  name: string;
  progress: number;
  category: 'core' | 'path' | 'devex';
}

// Module name mapping
const moduleNames: Record<string, string> = {
  // Core modules
  scaffold: 'Monorepo & Scaffolding',
  ui: 'UI System',
  auth: 'Identity & Auth',
  profiles: 'Profiles',
  groups: 'Groups & Orgs',
  feed: 'Feed',
  forum: 'Forum / Deliberation',
  governance: 'Proposals & Decisions',
  'social-economy': 'Social Economy Primitives',
  reputation: 'Support Points & Reputation',
  onboarding: 'Onboarding (Bridge)',
  search: 'Search & Tags',
  notifications: 'Notifications & Inbox',
  'docs-hooks': 'Docs Site Hooks',
  observability: 'Observability',
  security: 'Security & Privacy',

  // Path modules
  'path-education': 'Collaborative Education',
  'path-governance': 'Collective Governance',
  'path-community': 'Community Connection',
  'path-media': 'Collaborative Media & Culture',
  'path-wellbeing': 'Common Wellbeing',
  'path-economy': 'Social Economy',
  'path-technology': 'Cooperative Technology',
  'path-planet': 'Common Planet',

  // DevEx modules
  devcontainer: 'Dev Container',
  'ci-lint': 'CI Lint',
  'ci-docs': 'CI Docs',
  'ci-smoke': 'CI Smoke Tests',
  deploy: 'Deploy',
  secrets: 'Secrets',
};

// Determine category from module key
function getModuleCategory(key: string): 'core' | 'path' | 'devex' {
  if (key.startsWith('path-')) return 'path';
  if (['devcontainer', 'ci-lint', 'ci-docs', 'ci-smoke', 'deploy', 'secrets'].includes(key)) {
    return 'devex';
  }
  return 'core';
}

export async function GET() {
  try {
    // Read STATUS_v2.md from the repo root
    const statusFilePath = join(process.cwd(), '..', '..', 'docs', 'STATUS_v2.md');
    const content = await readFile(statusFilePath, 'utf-8');

    // Extract progress markers using regex
    // Pattern: <!-- progress:module-key=XX -->
    const progressRegex = /<!-- progress:([a-z-]+)=(\d+) -->/g;
    const modules: Module[] = [];
    let match;

    while ((match = progressRegex.exec(content)) !== null) {
      const key = match[1];
      const progress = parseInt(match[2], 10);
      const name = moduleNames[key];

      if (name) {
        modules.push({
          key,
          name,
          progress,
          category: getModuleCategory(key),
        });
      }
    }

    // Calculate statistics
    const stats = {
      overall: Math.round(
        modules.reduce((sum, m) => sum + m.progress, 0) / modules.length
      ),
      total: modules.length,
      started: modules.filter((m) => m.progress > 0).length,
      completed: modules.filter((m) => m.progress === 100).length,
    };

    // Group by category
    const grouped = {
      core: modules.filter((m) => m.category === 'core'),
      path: modules.filter((m) => m.category === 'path'),
      devex: modules.filter((m) => m.category === 'devex'),
    };

    return NextResponse.json({
      success: true,
      stats,
      modules: grouped,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to read STATUS_v2.md:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load progress data',
      },
      { status: 500 }
    );
  }
}
