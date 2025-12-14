import { Metadata } from 'next'
import ProviderProfileClient from './ProviderProfileClient'

export const metadata: Metadata = {
  title: 'Provider Profile | Timebank | TogetherOS',
  description: 'View provider profile, services, and reviews in the TogetherOS timebank.',
}

export default async function ProviderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ProviderProfileClient providerId={id} />
}
