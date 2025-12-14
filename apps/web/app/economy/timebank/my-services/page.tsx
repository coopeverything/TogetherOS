import { Metadata } from 'next'
import MyServicesClient from './MyServicesClient'

export const metadata: Metadata = {
  title: 'My Services | Timebank | TogetherOS',
  description: 'Manage your service offerings in the TogetherOS timebank marketplace.',
}

export default function MyServicesPage() {
  return <MyServicesClient />
}
