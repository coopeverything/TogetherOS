'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Input, Label, Alert, Progress } from '@/components/ui';
import { cn } from '@/lib/utils';
import { RPEarnedAnimation } from '@togetheros/ui/gamification';

interface User {
  id: string;
  email: string;
  name?: string;
  paths?: string[];
  skills?: string[];
  city?: string;
  bio?: string;
}

// RP rewards for each step
const STEP_RP_REWARDS: Record<number, { amount: number; label: string }> = {
  2: { amount: 15, label: 'Profile created' },
  3: { amount: 10, label: 'Location added' },
  4: { amount: 20, label: 'Paths selected' },
  5: { amount: 15, label: 'Skills shared' },
  6: { amount: 30, label: 'Questionnaire completed' },
  7: { amount: 25, label: 'Group joined' },
};

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

const QUESTIONNAIRE_QUESTIONS = [
  {
    id: 'motivation',
    question: 'What brings you to TogetherOS?',
    options: [
      'Finding like-minded people',
      'Learning new skills',
      'Contributing to projects',
      'Building community locally',
      'Exploring cooperation',
    ],
  },
  {
    id: 'involvement',
    question: 'How do you want to get involved?',
    options: [
      'Just exploring for now',
      'Participating in discussions',
      'Contributing skills to projects',
      'Leading initiatives',
      'Supporting others',
    ],
  },
  {
    id: 'time',
    question: 'How much time can you dedicate weekly?',
    options: [
      'A few minutes',
      '1-2 hours',
      '3-5 hours',
      '5+ hours',
      'Varies week to week',
    ],
  },
];

// Mock groups for joining (would come from API)
const SUGGESTED_GROUPS = [
  { id: 'newcomers', name: 'Newcomers Hub', emoji: '👋', members: 234, desc: 'Welcome space for new members' },
  { id: 'general', name: 'General Discussion', emoji: '💬', members: 567, desc: 'Open conversations about anything' },
  { id: 'projects', name: 'Project Showcase', emoji: '🚀', members: 189, desc: 'Share and discover projects' },
  { id: 'local', name: 'Local Connections', emoji: '📍', members: 342, desc: 'Find people in your area' },
];

export default function OnboardingClient({ user }: { user: User }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [state, setState] = useState<'idle' | 'saving' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showRPAnimation, setShowRPAnimation] = useState(false);
  const [currentRPReward, setCurrentRPReward] = useState<{ amount: number; label: string } | null>(null);
  const [totalRPEarned, setTotalRPEarned] = useState(0);

  const [formData, setFormData] = useState({
    name: user.name || '',
    bio: '',
    city: user.city || '',
    paths: user.paths || [] as string[],
    skills: '',
    questionnaire: {} as Record<string, string>,
    selectedGroup: '',
  });

  const totalSteps = 8;

  const awardRP = async (stepNum: number) => {
    const reward = STEP_RP_REWARDS[stepNum];
    if (!reward) return;

    // Call API to award RP
    try {
      await fetch('/api/gamification/onboarding-rp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          step: stepNum,
          rpAmount: reward.amount,
        }),
      });
    } catch (err) {
      console.error('Failed to award RP:', err);
    }

    setCurrentRPReward(reward);
    setTotalRPEarned((prev) => prev + reward.amount);
    setShowRPAnimation(true);
  };

  const handleNext = async () => {
    if (step < totalSteps) {
      // Award RP for completed step
      await awardRP(step);
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

  const handleQuestionAnswer = (questionId: string, answer: string) => {
    setFormData({
      ...formData,
      questionnaire: { ...formData.questionnaire, [questionId]: answer },
    });
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
          bio: formData.bio,
          city: formData.city,
          paths: formData.paths,
          skills: formData.skills
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          questionnaire: formData.questionnaire,
        }),
      });

      if (!profileResponse.ok) {
        const data = await profileResponse.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      // Join selected group if any
      if (formData.selectedGroup) {
        await fetch('/api/groups/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            groupId: formData.selectedGroup,
          }),
        }).catch(() => {}); // Non-blocking
      }

      // Initialize first-week journey
      await fetch('/api/challenges/first-week', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      }).catch(() => {}); // Non-blocking

      // Mark onboarding as complete (awards 50 RP bonus)
      const onboardingResponse = await fetch('/api/onboarding/complete', {
        method: 'POST',
      });

      if (!onboardingResponse.ok) {
        throw new Error('Failed to complete onboarding');
      }

      // Final RP celebration
      setCurrentRPReward({ amount: 50, label: 'Onboarding complete!' });
      setShowRPAnimation(true);

      // Redirect to dashboard after celebration
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error: any) {
      console.error('Complete onboarding error:', error);
      setState('error');
      setErrorMessage(error.message || 'Failed to complete. Please try again.');
    }
  };

  const canProceed = () => {
    if (step === 2) return formData.name.trim().length > 0;
    if (step === 4) return formData.paths.length > 0;
    if (step === 6) return Object.keys(formData.questionnaire).length >= 2;
    return true;
  };

  return (
    <div className="min-h-screen bg-bg-0 flex items-center justify-center px-4 py-8">
      {/* RP Animation */}
      {showRPAnimation && currentRPReward && (
        <RPEarnedAnimation
          amount={currentRPReward.amount}
          label={currentRPReward.label}
          onComplete={() => setShowRPAnimation(false)}
        />
      )}

      <div className="max-w-3xl w-full">
        <Card className="p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-base text-ink-700">Step {step} of {totalSteps}</span>
              {totalRPEarned > 0 && (
                <span className="text-base font-medium text-brand-600">
                  +{totalRPEarned} RP earned
                </span>
              )}
            </div>
            <Progress value={(step / totalSteps) * 100} variant="brand" />
          </div>

          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="text-center space-y-6">
              <div className="text-6xl mb-4">🌱</div>
              <h1 className="text-3xl font-bold text-ink-900">Welcome to TogetherOS</h1>
              <p className="text-xl text-ink-700">
                You've just joined a community building a new way to organize—where cooperation
                replaces competition, where communities solve their own problems, and where your
                skills actually matter.
              </p>
              <div className="bg-brand-50 border border-brand-200 rounded-xl p-4">
                <p className="text-brand-800 font-medium mb-2">🎮 Earn Reward Points (RP)</p>
                <p className="text-brand-700 text-base">
                  Complete each step to earn RP. Use RP to unlock badges, boost proposals, and recognize others!
                </p>
              </div>
              <Button onClick={handleNext} variant="default" className="w-full sm:w-auto">
                Let's Get Started →
              </Button>
            </div>
          )}

          {/* Step 2: Name + Bio */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-ink-900 mb-2">Tell us about yourself</h1>
                <p className="text-xl text-ink-700">
                  This helps others connect with you.
                </p>
                <p className="text-base text-brand-600 mt-2">+15 RP for completing this step</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">What should we call you? *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name or nickname"
                    autoFocus
                  />
                </div>
                <div>
                  <Label htmlFor="bio">Short bio (optional)</Label>
                  <textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us a bit about yourself..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-4">
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

          {/* Step 3: Location */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-ink-900 mb-2">Where are you based?</h1>
                <p className="text-xl text-ink-700">
                  This helps us connect you with local initiatives and groups.
                </p>
                <p className="text-base text-brand-600 mt-2">+10 RP for completing this step</p>
              </div>

              <div>
                <Label htmlFor="city">City (optional)</Label>
                <Input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g., San Francisco, London, Tokyo"
                />
                <p className="text-base text-ink-500 mt-1">
                  You can always change this later in your profile settings.
                </p>
              </div>

              <div className="flex gap-4">
                <Button onClick={handleBack} variant="secondary" className="flex-1">
                  Back
                </Button>
                <Button onClick={handleNext} variant="default" className="flex-1">
                  {formData.city ? 'Continue' : 'Skip for now'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Cooperation Paths */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-ink-900 mb-2">Choose Your Paths</h1>
                <p className="text-xl text-ink-700">
                  Select the areas you're interested in. You can choose as many as you like.
                </p>
                <p className="text-base text-brand-600 mt-2">+20 RP for selecting your paths</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {COOPERATION_PATHS.map((path) => {
                  const isSelected = formData.paths.includes(path.id);
                  return (
                    <Card
                      key={path.id}
                      className={cn(
                        "p-4 cursor-pointer hover:shadow-md transition-all relative",
                        isSelected && "border-brand-500 bg-brand-50 ring-2 ring-brand-200"
                      )}
                      onClick={() => togglePath(path.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">{path.emoji}</div>
                        <div>
                          <div className="font-semibold text-ink-900">{path.name}</div>
                          <div className="text-base text-ink-700">{path.desc}</div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 text-brand-600 text-2xl">✓</div>
                      )}
                    </Card>
                  );
                })}
              </div>

              <div className="flex gap-4">
                <Button onClick={handleBack} variant="secondary" className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  variant="default"
                  disabled={!canProceed()}
                  className="flex-1"
                >
                  Continue ({formData.paths.length} selected)
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Skills */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-ink-900 mb-2">What skills can you share?</h1>
                <p className="text-xl text-ink-700">
                  Help others know what you can contribute.
                </p>
                <p className="text-base text-brand-600 mt-2">+15 RP for sharing your skills</p>
              </div>

              <div>
                <Label htmlFor="skills">Skills (optional)</Label>
                <Input
                  id="skills"
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="e.g., Web Development, Graphic Design, Community Organizing"
                />
                <p className="text-base text-ink-500 mt-1">Separate multiple skills with commas</p>
              </div>

              <div className="flex gap-4">
                <Button onClick={handleBack} variant="secondary" className="flex-1">
                  Back
                </Button>
                <Button onClick={handleNext} variant="default" className="flex-1">
                  {formData.skills ? 'Continue' : 'Skip for now'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 6: Quick Questionnaire */}
          {step === 6 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-ink-900 mb-2">A few quick questions</h1>
                <p className="text-xl text-ink-700">
                  Help us personalize your experience.
                </p>
                <p className="text-base text-brand-600 mt-2">+30 RP for completing questionnaire</p>
              </div>

              <div className="space-y-6">
                {QUESTIONNAIRE_QUESTIONS.map((q) => (
                  <div key={q.id} className="space-y-3">
                    <p className="font-medium text-ink-900">{q.question}</p>
                    <div className="flex flex-wrap gap-2">
                      {q.options.map((option) => {
                        const isSelected = formData.questionnaire[q.id] === option;
                        return (
                          <button
                            key={option}
                            onClick={() => handleQuestionAnswer(q.id, option)}
                            className={cn(
                              "px-4 py-2 rounded-full text-base transition-all",
                              isSelected
                                ? "bg-brand-600 text-white"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:bg-gray-700"
                            )}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <Button onClick={handleBack} variant="secondary" className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  variant="default"
                  disabled={!canProceed()}
                  className="flex-1"
                >
                  Continue ({Object.keys(formData.questionnaire).length}/3 answered)
                </Button>
              </div>
            </div>
          )}

          {/* Step 7: Join First Group */}
          {step === 7 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-ink-900 mb-2">Join your first group</h1>
                <p className="text-xl text-ink-700">
                  Groups are where the community comes together. Pick one to start!
                </p>
                <p className="text-base text-brand-600 mt-2">+25 RP for joining a group</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SUGGESTED_GROUPS.map((group) => {
                  const isSelected = formData.selectedGroup === group.id;
                  return (
                    <Card
                      key={group.id}
                      className={cn(
                        "p-4 cursor-pointer hover:shadow-md transition-all relative",
                        isSelected && "border-brand-500 bg-brand-50 ring-2 ring-brand-200"
                      )}
                      onClick={() => setFormData({ ...formData, selectedGroup: group.id })}
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">{group.emoji}</div>
                        <div>
                          <div className="font-semibold text-ink-900">{group.name}</div>
                          <div className="text-base text-ink-700">{group.desc}</div>
                          <div className="text-sm text-ink-500 mt-1">{group.members} members</div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 text-brand-600 text-2xl">✓</div>
                      )}
                    </Card>
                  );
                })}
              </div>

              <div className="flex gap-4">
                <Button onClick={handleBack} variant="secondary" className="flex-1">
                  Back
                </Button>
                <Button onClick={handleNext} variant="default" className="flex-1">
                  {formData.selectedGroup ? 'Continue' : 'Skip for now'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 8: Completion */}
          {step === 8 && (
            <div className="text-center space-y-6">
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-3xl font-bold text-ink-900">You're all set!</h1>

              <div className="bg-gradient-to-r from-brand-50 to-green-50 border border-brand-200 rounded-xl p-6">
                <p className="text-3xl font-bold text-brand-700 mb-2">
                  {totalRPEarned + 50} RP Total
                </p>
                <p className="text-brand-600">
                  Great start! You've earned reward points to use across the platform.
                </p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <p className="text-orange-800 font-medium mb-2">🔥 First Week Journey</p>
                <p className="text-orange-700 text-base">
                  Complete daily challenges this week to earn bonus RP and unlock badges!
                </p>
              </div>

              {state === 'error' && (
                <Alert variant="danger" title="Error">
                  {errorMessage}
                </Alert>
              )}

              <Button
                onClick={handleComplete}
                variant="default"
                disabled={state === 'saving'}
                className="w-full sm:w-auto px-8"
              >
                {state === 'saving' ? 'Finishing up...' : 'Enter TogetherOS →'}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
