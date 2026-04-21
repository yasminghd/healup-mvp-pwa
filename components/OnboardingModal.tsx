import React, { useState } from 'react';
import { ChevronRight, Leaf, ShieldCheck, Sparkles, X } from 'lucide-react';

interface OnboardingModalProps {
  onClose: () => void;
}

const steps = [
  {
    title: 'Welcome to HealUp',
    body: 'This space is meant to feel gentle, clear, and manageable, especially on harder symptom days.',
    icon: Leaf,
  },
  {
    title: 'Track only what helps',
    body: 'You can keep symptom logging simple, choose extra symptoms only when useful, and adjust limits to fit your routine.',
    icon: Sparkles,
  },
  {
    title: 'Privacy comes first',
    body: 'Your check-ins are here to support your care and your patterns. Quiet support tools stay optional.',
    icon: ShieldCheck,
  },
  {
    title: 'Go at your pace',
    body: 'Rest mode, larger text, dark mode, and reduced motion can all help the app feel lighter when you need that.',
    icon: Leaf,
  },
];

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onClose }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = steps[stepIndex];
  const Icon = currentStep.icon;
  const isLastStep = stepIndex === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#3d4b3e]/28 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[32px] border border-matcha-100 bg-[linear-gradient(180deg,#fffdf9_0%,#f8f4eb_100%)] p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="rounded-3xl bg-matcha-50 p-4 text-matcha-700">
            <Icon size={28} />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
            aria-label="Skip onboarding"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-matcha-600">
            Step {stepIndex + 1} of {steps.length}
          </p>
          <h2 className="mt-3 text-2xl font-bold text-gray-900">{currentStep.title}</h2>
          <p className="mt-3 max-w-lg text-sm leading-7 text-gray-600">{currentStep.body}</p>
        </div>

        <div className="mt-6 flex gap-2">
          {steps.map((_, index) => (
            <span
              key={index}
              className={`h-2 rounded-full transition-all ${index === stepIndex ? 'w-10 bg-matcha-600' : 'w-2 bg-matcha-200'}`}
            />
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-matcha-100 px-4 py-3 text-sm font-semibold text-matcha-800 transition-all hover:bg-matcha-50"
          >
            Skip for now
          </button>

          <button
            type="button"
            onClick={() => {
              if (isLastStep) {
                onClose();
                return;
              }

              setStepIndex((current) => current + 1);
            }}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-matcha-600 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-matcha-700"
          >
            {isLastStep ? 'Start gently' : 'Next'}
            {!isLastStep && <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
