/**
 * Onboarding Editor Layout
 *
 * Immersive full-screen layout without nav bar or footer.
 * This provides a distraction-free editing experience.
 */

export default function OnboardingEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-bg-2">
      {children}
    </div>
  );
}
