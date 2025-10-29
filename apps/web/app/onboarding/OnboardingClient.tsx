'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import styles from './onboarding.module.css';

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
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Progress Bar */}
        <div className={styles.progress}>
          <div
            className={styles.progressBar}
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className={styles.step}>
            <h1 className={styles.title}>Welcome to TogetherOS</h1>
            <p className={styles.intro}>
              You've just joined a community building a new way to organize—where cooperation
              replaces competition, where communities solve their own problems, and where your
              skills actually matter.
            </p>
            <p className={styles.intro}>
              Let's take a few moments to set up your profile so you can connect with the right
              people and projects.
            </p>
            <button onClick={handleNext} className={styles.button}>
              Let's Get Started
            </button>
          </div>
        )}

        {/* Step 2: Name */}
        {step === 2 && (
          <div className={styles.step}>
            <h1 className={styles.title}>What should we call you?</h1>
            <p className={styles.intro}>
              This can be your real name, a nickname, or whatever you'd like to be known as in
              the community.
            </p>

            <div className={styles.inputGroup}>
              <label htmlFor="name" className={styles.label}>
                Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
                className={styles.input}
                autoFocus
              />
            </div>

            <div className={styles.buttonGroup}>
              <button onClick={handleBack} className={styles.buttonSecondary}>
                Back
              </button>
              <button
                onClick={handleNext}
                className={styles.button}
                disabled={!canProceed()}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Paths */}
        {step === 3 && (
          <div className={styles.step}>
            <h1 className={styles.title}>Choose Your Paths</h1>
            <p className={styles.intro}>
              Select the areas you're interested in. You can choose as many as you like, and you
              can always change these later.
            </p>

            <div className={styles.pathsGrid}>
              {COOPERATION_PATHS.map((path) => {
                const isSelected = formData.paths.includes(path.id);
                return (
                  <button
                    key={path.id}
                    type="button"
                    onClick={() => togglePath(path.id)}
                    className={`${styles.pathCard} ${isSelected ? styles.pathCardActive : ''}`}
                  >
                    <div className={styles.pathEmoji}>{path.emoji}</div>
                    <div className={styles.pathName}>{path.name}</div>
                    <div className={styles.pathDesc}>{path.desc}</div>
                    {isSelected && <div className={styles.checkmark}>✓</div>}
                  </button>
                );
              })}
            </div>

            <div className={styles.buttonGroup}>
              <button onClick={handleBack} className={styles.buttonSecondary}>
                Back
              </button>
              <button
                onClick={handleNext}
                className={styles.button}
                disabled={!canProceed()}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Skills (Optional) */}
        {step === 4 && (
          <div className={styles.step}>
            <h1 className={styles.title}>What skills can you share?</h1>
            <p className={styles.intro}>
              This is optional, but it helps others know what you can contribute. You can add
              more skills anytime from your profile.
            </p>

            <div className={styles.inputGroup}>
              <label htmlFor="skills" className={styles.label}>
                Skills (optional)
              </label>
              <input
                id="skills"
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="e.g. Web Development, Graphic Design, Community Organizing"
                className={styles.input}
              />
              <p className={styles.hint}>Separate multiple skills with commas</p>
            </div>

            {state === 'error' && <div className={styles.error}>{errorMessage}</div>}

            <div className={styles.buttonGroup}>
              <button onClick={handleBack} className={styles.buttonSecondary}>
                Back
              </button>
              <button
                onClick={handleComplete}
                className={styles.button}
                disabled={state === 'saving'}
              >
                {state === 'saving' ? 'Completing...' : 'Complete Setup'}
              </button>
            </div>

            <button
              onClick={handleComplete}
              className={styles.skipButton}
              disabled={state === 'saving'}
            >
              Skip for now
            </button>
          </div>
        )}

        {/* Step Indicator */}
        <div className={styles.stepIndicator}>
          Step {step} of {totalSteps}
        </div>
      </div>
    </div>
  );
}
