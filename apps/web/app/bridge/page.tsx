/**
 * Bridge Landing Page
 *
 * Minimal public page where visitors can ask "What is TogetherOS?"
 * and get a calm, mission-first answer.
 *
 * Part of Bridge Landing Pilot (internal MVP)
 * @see docs/modules/bridge/landing-pilot.md
 */

import { BridgeChat } from '@togetheros/ui/bridge';

export const metadata = {
  title: 'Bridge - TogetherOS',
  description: 'Ask Bridge what TogetherOS is.',
};

export default function BridgePage() {
  return (
    <main>
      <BridgeChat />
    </main>
  );
}
