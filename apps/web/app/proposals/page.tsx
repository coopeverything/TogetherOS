import { redirect } from 'next/navigation'

export default function ProposalsPage() {
  // Redirect to unified governance page
  // "Proposals" and "Governance" are now the same concept
  redirect('/governance')
}
