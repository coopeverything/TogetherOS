/**
 * Danger.js Configuration
 * Validates PR descriptions for required proof lines
 */

import { danger, warn, fail } from 'danger';

// Get PR body
const pr = danger.github.pr;
const body = pr.body || '';

// Required proof line patterns
const requiredProofLines = [
  { pattern: /LINT=OK/i, name: 'LINT=OK' },
];

// Optional proof lines (warn if missing)
const optionalProofLines = [
  { pattern: /VALIDATORS=GREEN/i, name: 'VALIDATORS=GREEN' },
  { pattern: /SMOKE=OK/i, name: 'SMOKE=OK' },
  { pattern: /DOCS=OK/i, name: 'DOCS=OK' },
];

// Check required proof lines
let missingRequired = [];
for (const proofLine of requiredProofLines) {
  if (!proofLine.pattern.test(body)) {
    missingRequired.push(proofLine.name);
  }
}

if (missingRequired.length > 0) {
  fail(
    `❌ Missing required proof lines: ${missingRequired.join(', ')}\n\n` +
    `Please add proof lines to your PR description after running validation locally.\n\n` +
    `Expected format:\n` +
    `\`\`\`\n` +
    `LINT=OK\n` +
    `VALIDATORS=GREEN (or SMOKE=OK)\n` +
    `\`\`\``
  );
}

// Check optional proof lines (warn only)
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

console.log('✅ Danger.js checks complete');
