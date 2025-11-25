// apps/web/app/invite/page.tsx
// Invitation hub - view sent invitations and send new ones

import { Suspense } from 'react';
import InvitePageClient from './InvitePageClient';

export const metadata = {
  title: 'Invite Friends | TogetherOS',
  description: 'Invite friends to join TogetherOS and earn rewards',
};

export default function InvitePage() {
  return (
    <Suspense fallback={<InvitePageSkeleton />}>
      <InvitePageClient />
    </Suspense>
  );
}

function InvitePageSkeleton() {
  return (
    <div className="min-h-screen bg-bg-0 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-96 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}
