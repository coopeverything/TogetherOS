/**
 * Bridge Landing Page
 *
 * Minimal public page where visitors can ask Bridge about Coopeverything
 * and get a calm, mission-first answer.
 *
 * Part of Bridge Landing Pilot (internal MVP)
 * @see docs/modules/bridge/landing-pilot.md
 */

import { BridgeChat } from '@togetheros/ui/bridge';

export const metadata = {
  title: 'Bridge - Coopeverything',
  description: 'Chat with Bridge, your cooperative assistant. Learn about Coopeverything and how cooperation can improve your life.',
};

export default function BridgePage() {
  return (
    <main>
      <BridgeChat />
    </main>
  );
}
