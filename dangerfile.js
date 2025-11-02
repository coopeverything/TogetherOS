/**
 * Danger.js Configuration
 * Validates PR descriptions for required proof lines
 */

import { danger, warn, fail } from 'danger';

// Get PR body
const pr = danger.github.pr;
const body = pr.body || '';

// Skip proof line validation for Dependabot PRs
const isDependabot = pr.user.login === 'dependabot[bot]';

// Detect target branch for two-tier proof line requirements
const isYoloPR = pr.base.ref === 'yolo';

// Required proof lines differ by branch (align with actual CI checks)
// Yolo: Tests only (lint/smoke don't run on yolo branch)
// Main: Full suite (lint + smoke + tests all run on main branch)
const requiredProofLines = isYoloPR
  ? [{ pattern: /TESTS=OK/i, name: 'TESTS=OK' }]
  : [
      { pattern: /LINT=OK/i, name: 'LINT=OK' },
      { pattern: /SMOKE=OK/i, name: 'SMOKE=OK' },
      { pattern: /TESTS=OK/i, name: 'TESTS=OK' },
    ];

// Optional proof lines (warn if missing)
const optionalProofLines = isYoloPR
  ? [
      { pattern: /LINT=OK/i, name: 'LINT=OK' },
      { pattern: /VALIDATORS=GREEN/i, name: 'VALIDATORS=GREEN' },
      { pattern: /DOCS=OK/i, name: 'DOCS=OK' },
    ]
  : [
      { pattern: /VALIDATORS=GREEN/i, name: 'VALIDATORS=GREEN' },
      { pattern: /DOCS=OK/i, name: 'DOCS=OK' },
    ];

// Check required proof lines (skip for Dependabot)
if (!isDependabot) {
  let missingRequired = [];
  for (const proofLine of requiredProofLines) {
    if (!proofLine.pattern.test(body)) {
      missingRequired.push(proofLine.name);
    }
  }

  if (missingRequired.length > 0) {
    const branchInfo = isYoloPR
      ? `yolo branch (tests only)`
      : `main branch (full validation)`;
    const exampleFormat = isYoloPR
      ? `TESTS=OK\nLINT=OK (optional, run ./scripts/validate.sh locally)`
      : `LINT=OK\nSMOKE=OK\nTESTS=OK`;

    fail(
      `❌ Missing required proof lines for ${branchInfo}: ${missingRequired.join(', ')}\n\n` +
      `Please add proof lines to your PR description after running validation locally.\n\n` +
      `Expected format:\n` +
      `\`\`\`\n` +
      `${exampleFormat}\n` +
      `\`\`\``
    );
  }
}

// Check optional proof lines (skip for Dependabot)
if (!isDependabot) {
  let missingOptional = [];
  for (const proofLine of optionalProofLines) {
    if (!proofLine.pattern.test(body)) {
      missingOptional.push(proofLine.name);
    }
  }

  if (missingOptional.length > 0) {
    warn(
      `⚠️  Consider adding these proof lines: ${missingOptional.join(', ')}\n\n` +
      `Run \`./scripts/validate.sh\` locally to generate proof lines.`
    );
  }

  // Check for category and keywords
  if (!/Category:/i.test(body)) {
    warn('⚠️  PR description should include "Category: <one of 8 Cooperation Paths>"');
  }

  if (!/Keywords:/i.test(body)) {
    warn('⚠️  PR description should include "Keywords: comma, separated, words"');
  }
}

// Warn if PR is too large
const changedFiles = danger.git.created_files.length + danger.git.modified_files.length;
if (changedFiles > 20) {
  warn(
    `⚠️  This PR changes ${changedFiles} files. Consider breaking it into smaller PRs.\n\n` +
    `Smaller PRs are easier to review and less likely to introduce bugs.`
  );
}

// Check if PR title follows convention
const titlePattern = /^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?:/;
if (!titlePattern.test(pr.title)) {
  warn(
    `⚠️  PR title should follow conventional commits format:\n` +
    `\`<type>(<scope>): <description>\`\n\n` +
    `Examples:\n` +
    `- feat(governance): add proposal scoring util\n` +
    `- fix(ci): correct docs workflow include paths\n` +
    `- docs: align overview with contributor hub`
  );
}

// Check Dependabot compatibility score
if (isDependabot) {
  // Look for compatibility score badge in PR body
  const scoreMatch = body.match(/compatibility_score[^)]*new-version=([^)]+)\)/);

  if (scoreMatch) {
    // Try to extract percentage from badge URL or surrounding text
    const percentMatch = body.match(/(\d+)%[^)]*compatibility/i);

    if (percentMatch) {
      const score = parseInt(percentMatch[1]);

      if (score < 50) {
        warn(
          `🔴 **Compatibility score: ${score}%** (High risk)\n\n` +
          `This upgrade has a low success rate in other repositories. ` +
          `Review the changelog carefully and test locally before merging.\n\n` +
          `**Recommendation:** Consider deferring this update or closing the PR.`
        );
      } else if (score < 75) {
        warn(
          `🟡 **Compatibility score: ${score}%** (Moderate risk)\n\n` +
          `This upgrade has a moderate success rate in other repositories. ` +
          `Review the changelog and test locally before merging.\n\n` +
          `**Threshold:** 75% (project policy)`
        );
      } else {
        // Score ≥75%, informational only
        console.log(`✅ Compatibility score: ${score}% (meets 75% threshold)`);
      }
    } else {
      // Badge exists but couldn't extract score (might be "unknown")
      warn(
        `⚠️  **Compatibility score: Unknown**\n\n` +
        `This version is too new or has insufficient data (<5 public repos tested). ` +
        `Check ecosystem readiness before merging:\n` +
        `- Review release notes and changelog\n` +
        `- Check if framework (Next.js) officially supports this version\n` +
        `- Test locally with your specific setup`
      );
    }
  }
}

console.log('✅ Danger.js checks complete');
