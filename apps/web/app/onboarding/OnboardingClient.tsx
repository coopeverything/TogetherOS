'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Input, Label, Alert, Progress } from '@/components/ui';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  email: string;
  name?: string;
  paths?: string[];
  skills?: string[];
}

const COOPERATION_PATHS = [
  { id: 'education', name: 'Collaborative Education', emoji: '📚', desc: 'Learning together, teaching each other' },
  { id: 'economy', name: 'Social Economy', emoji: '💰', desc: 'Fair trade, worker ownership, mutual aid' },
  { id: 'wellbeing', name: 'Common Wellbeing', emoji: '🫶', desc: 'Mental health, physical health, community care' },
  { id: 'technology', name: 'Cooperative Technology', emoji: '💻', desc: 'Open source, ethical tech, digital commons' },
  { id: 'governance', name: 'Collective Governance', emoji: '🏛️', desc: 'Democratic decision-making, consensus building' },
  { id: 'community', name: 'Community Connection', emoji: '🤝', desc: 'Building relationships, organizing locally' },
  { id: 'media', name: 'Collaborative Media', emoji: '🎨', desc: 'Independent media, creative commons, storytelling' },
  { id: 'planet', name: 'Common Planet', emoji: '🌍', desc: 'Sustainability, climate action, ecological justice' },
];

export default function OnboardingClient({ user }: { user: User }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [state, setState] = useState<'idle' | 'saving' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    name: user.name || '',
    paths: user.paths || [],
    skills: '',
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const togglePath = (pathId: string) => {
    const newPaths = formData.paths.includes(pathId)
      ? formData.paths.filter((p) => p !== pathId)
      : [...formData.paths, pathId];
    setFormData({ ...formData, paths: newPaths });
  };

  const handleComplete = async () => {
    setState('saving');
    setErrorMessage('');

    try {
      // Update profile
      const profileResponse = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          paths: formData.paths,
          skills: formData.skills
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });

      if (!profileResponse.ok) {
        const data = await profileResponse.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      // Mark onboarding as complete
      const onboardingResponse = await fetch('/api/onboarding/complete', {
        method: 'POST',
      });

      if (!onboardingResponse.ok) {
        throw new Error('Failed to complete onboarding');
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Complete onboarding error:', error);
      setState('error');
      setErrorMessage(error.message || 'Failed to complete. Please try again.');
    }
  };

  const canProceed = () => {
    if (step === 2) return formData.name.trim().length > 0;
    if (step === 3) return formData.paths.length > 0;
    return true;
  };

  return (
    <div className="min-h-screen bg-bg-0 flex items-center justify-center px-4 py-8">
      <div className="max-w-3xl w-full">
        <Card className="p-8">
          {/* Progress Bar */}
          <Progress value={(step / totalSteps) * 100} variant="brand" className="mb-8" />

          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="text-center space-y-6">
              <h1 className="text-3xl font-bold text-ink-900">Welcome to TogetherOS</h1>
              <p className="text-lg text-ink-700">
                You've just joined a community building a new way to organize—where cooperation
                replaces competition, where communities solve their own problems, and where your
                skills actually matter.
              </p>
              <p className="text-lg text-ink-700">
                Let's take a few moments to set up your profile so you can connect with the right
                people and projects.
              </p>
              <Button onClick={handleNext} variant="default" className="w-full sm:w-auto">
                Let's Get Started
              </Button>
            </div>
          )}

          {/* Step 2: Name */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-ink-900 mb-2">What should we call you?</h1>
                <p className="text-lg text-ink-700">
                  This can be your real name, a nickname, or whatever you'd like to be known as in
                  the community.
                </p>
              </div>

              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleBack} variant="secondary" className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  variant="default"
                  disabled={!canProceed()}
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Paths */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-ink-900 mb-2">Choose Your Paths</h1>
                <p className="text-lg text-ink-700">
                  Select the areas you're interested in. You can choose as many as you like, and you
                  can always change these later.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {COOPERATION_PATHS.map((path) => {
                  const isSelected = formData.paths.includes(path.id);
                  return (
                    <Card
                      key={path.id}
                      className={cn(
                        "p-6 cursor-pointer hover:shadow-md transition-shadow relative",
                        isSelected && "border-brand-500 bg-brand-50"
                      )}
                      onClick={() => togglePath(path.id)}
                    >
                      <div className="text-4xl mb-3">{path.emoji}</div>
                      <div className="font-semibold text-ink-900 mb-2">{path.name}</div>
                      <div className="text-sm text-ink-700">{path.desc}</div>
                      {isSelected && (
                        <div className="absolute top-4 right-4 text-brand-600 text-2xl">✓</div>
                      )}
                    </Card>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <Button onClick={handleBack} variant="secondary" className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  variant="default"
                  disabled={!canProceed()}
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Skills (Optional) */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-ink-900 mb-2">What skills can you share?</h1>
                <p className="text-lg text-ink-700">
                  This is optional, but it helps others know what you can contribute. You can add
                  more skills anytime from your profile.
                </p>
              </div>

              <div>
                <Label htmlFor="skills">Skills (optional)</Label>
                <Input
                  id="skills"
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="e.g. Web Development, Graphic Design, Community Organizing"
                />
                <p className="text-sm text-ink-700 mt-1">Separate multiple skills with commas</p>
              </div>

              {state === 'error' && (
                <Alert variant="danger" title="Error">
                  {errorMessage}
                </Alert>
              )}

              <div className="flex gap-3">
                <Button onClick={handleBack} variant="secondary" className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  variant="default"
                  disabled={state === 'saving'}
                  className="flex-1"
                >
                  {state === 'saving' ? 'Completing...' : 'Complete Setup'}
                </Button>
              </div>

              <div className="text-center">
                <Button
                  onClick={handleComplete}
                  variant="link"
                  disabled={state === 'saving'}
                >
                  Skip for now
                </Button>
              </div>
            </div>
          )}

          {/* Step Indicator */}
          <div className="text-center text-sm text-ink-700 mt-6">
            Step {step} of {totalSteps}
          </div>
        </Card>
      </div>
    </div>
  );
}
