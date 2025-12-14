import { Metadata } from 'next'
import MarketplaceClient from './MarketplaceClient'

export const metadata: Metadata = {
  title: 'Timebank Marketplace | TogetherOS',
  description: 'Exchange skills, build community. Browse services and offer your talents in our cooperative timebank.',
}

export default function MarketplacePage() {
  return <MarketplaceClient />
}
