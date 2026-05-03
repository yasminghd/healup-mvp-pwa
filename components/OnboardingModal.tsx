import React, { useState } from 'react';
import { ChevronRight, Leaf, ShieldCheck, Sparkles, X } from 'lucide-react';
import { t } from '../translations';

interface OnboardingModalProps {
  onClose: () => void;
  language: string;
}

const stepConfig = [
  { titleKey: 'onboard1Title', bodyKey: 'onboard1Body', icon: Leaf },
  { titleKey: 'onboard2Title', bodyKey: 'onboard2Body', icon: Sparkles },
  { titleKey: 'onboard3Title', bodyKey: 'onboard3Body', icon: ShieldCheck },
  { titleKey: 'onboard4Title', bodyKey: 'onboard4Body', icon: Leaf },
];

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onClose, language }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = stepConfig[stepIndex];
  const Icon = currentStep.icon;
  const isLastStep = stepIndex === stepConfig.length - 1;

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
            aria-label={t('skipOnboarding', language)}
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-matcha-600">
            {t('stepLabel', language)} {stepIndex + 1} {t('ofLabel', language)} {stepConfig.length}
          </p>
          <h2 className="mt-3 text-2xl font-bold text-gray-900">{t(currentStep.titleKey, language)}</h2>
          <p className="mt-3 max-w-lg text-sm leading-7 text-gray-600">{t(currentStep.bodyKey, language)}</p>
        </div>

        <div className="mt-6 flex gap-2">
          {stepConfig.map((_, index) => (
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
            {t('skipForNow', language)}
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
            {isLastStep ? t('startGently', language) : t('next', language)}
            {!isLastStep && <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
