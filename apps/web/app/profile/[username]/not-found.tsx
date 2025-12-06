import Link from 'next/link';
import { Card, Button } from '@/components/ui';

export default function ProfileNotFound() {
  return (
    <div className="min-h-screen bg-bg-0 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-4">
        <div className="text-6xl">🔍</div>
        <h1 className="text-3xl font-bold text-ink-900">Profile Not Found</h1>
        <p className="text-ink-700">
          The profile you're looking for doesn't exist or has been removed.
        </p>
        <div className="pt-4">
          <Link href="/dashboard">
            <Button variant="default">Back to Dashboard</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
