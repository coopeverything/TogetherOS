/**
 * Minority Report Handlers
 * Business logic for minority report generation and management
 */

import {
  generateMinorityReport as generateMinorityReportDb,
  saveMinorityReport as saveMinorityReportDb,
  getMinorityPositions,
} from '@togetheros/db';
import { getProposalById, updateProposal } from '@togetheros/db';

/**
 * Generate a minority report for a proposal
 * Compiles dissenting positions into a formal document
 */
export async function generateMinorityReport(proposalId: string): Promise<string> {
  const proposal = await getProposalById(proposalId);
  if (!proposal) {
    throw new Error('Proposal not found');
  }

  // Only generate for decided proposals
  if (proposal.status !== 'decided' && proposal.status !== 'delivery' && proposal.status !== 'reviewed') {
    throw new Error('Minority reports can only be generated after a decision is made');
  }

  return await generateMinorityReportDb(proposalId);
}

/**
 * Generate and save a minority report
 */
export async function generateAndSaveMinorityReport(proposalId: string): Promise<string> {
  const report = await generateMinorityReport(proposalId);

  if (report) {
    await saveMinorityReportDb(proposalId, report);
  }

  return report;
}

/**
 * Get the minority report for a proposal
 */
export async function getMinorityReport(proposalId: string): Promise<string | null> {
  const proposal = await getProposalById(proposalId);
  if (!proposal) {
    throw new Error('Proposal not found');
  }

  return proposal.minorityReport || null;
}

/**
 * Manually update minority report
 * Allows moderators/admins to edit the generated report
 */
export async function updateMinorityReport(
  proposalId: string,
  report: string,
  editorId: string
): Promise<void> {
  const proposal = await getProposalById(proposalId);
  if (!proposal) {
    throw new Error('Proposal not found');
  }

  // Add edit attribution
  const timestamp = new Date().toISOString().split('T')[0];
  const editedReport = report + `\n\n---\n*Last edited by moderator on ${timestamp}*`;

  await saveMinorityReportDb(proposalId, editedReport);
}

/**
 * Clear minority report
 */
export async function clearMinorityReport(proposalId: string): Promise<void> {
  await updateProposal(proposalId, { minorityReport: undefined });
}

/**
 * Check if a proposal has minority positions that warrant a report
 */
export async function hasMinorityPositions(proposalId: string): Promise<boolean> {
  const minorityPositions = await getMinorityPositions(proposalId);
  return minorityPositions.length > 0;
}
