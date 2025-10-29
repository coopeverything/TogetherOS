// apps/web/app/status/page.tsx
import { Metadata } from 'next';
import StatusClient from './StatusClient';

export const metadata: Metadata = {
  title: 'Progress Status - TogetherOS',
  description: 'Track development progress across all TogetherOS modules',
};

export default function StatusPage() {
  return <StatusClient />;
}
