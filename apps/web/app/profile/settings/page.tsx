import { redirect } from 'next/navigation';

export default function ProfileSettingsPage() {
  // For MVP, redirect to profile edit
  // In future, this can be a dedicated settings page for account management
  redirect('/profile');
}
