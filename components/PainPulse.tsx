import React, { useEffect, useMemo, useState } from 'react';
import { HeartHandshake, Sparkles } from 'lucide-react';
import PulseCircle from './painPulse/PulseCircle';
import StateView from './painPulse/StateView';
import { t } from '../translations';

type PulseMode = 'request' | 'respond';
type RequestState = 'idle' | 'sending' | 'received';
type ResponseState = 'idle' | 'sending' | 'sent';

const RESPONSE_PRESET_KEYS = ['pulsePreset1', 'pulsePreset2', 'pulsePreset3', 'pulsePreset4'];
const RESPONSE_EMOJIS = ['🤍', '🌿', '🫶', '💚', '✨'];

interface PainPulseProps {
  language: string;
}

const PainPulse: React.FC<PainPulseProps> = ({ language }) => {
  const [mode, setMode] = useState<PulseMode>('request');
  const [requestState, setRequestState] = useState<RequestState>('idle');
  const [responseState, setResponseState] = useState<ResponseState>('idle');
  const presetMessages = useMemo(() => RESPONSE_PRESET_KEYS.map((key) => t(key, language)), [language]);
  const [supportMessage, setSupportMessage] = useState(presetMessages[0]);
  const [selectedEmoji, setSelectedEmoji] = useState(RESPONSE_EMOJIS[0]);

  useEffect(() => {
    setSupportMessage((current) => {
      // If user hasn't customized, refresh to the new language's first preset
      if (RESPONSE_PRESET_KEYS.some((key) => RESPONSE_PRESET_KEYS.map((k) => t(k, language)).includes(current)) || !current) {
        return presetMessages[0];
      }
      return current;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  useEffect(() => {
    if (requestState !== 'sending') {
      return;
    }

    const timer = window.setTimeout(() => {
      setRequestState('received');
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [requestState]);

  useEffect(() => {
    if (responseState !== 'sending') {
      return;
    }

    const timer = window.setTimeout(() => {
      setResponseState('sent');
    }, 1100);

    return () => window.clearTimeout(timer);
  }, [responseState]);

  const handleSendPulse = () => {
    if (requestState === 'sending') return;
    setRequestState('sending');
  };

  const handleSendSupport = () => {
    if (responseState === 'sending') return;
    setResponseState('sending');
  };

  const resetRequester = () => {
    setRequestState('idle');
  };

  const resetResponder = () => {
    setResponseState('idle');
    setSupportMessage(presetMessages[0]);
    setSelectedEmoji(RESPONSE_EMOJIS[0]);
  };

  const renderRequesterContent = () => {
    if (requestState === 'received') {
      return (
        <StateView
          eyebrow={t('painPulse', language)}
          title={t('pulseSent', language)}
          description={t('noSupportSignals', language)}
        >
          <button
            type="button"
            onClick={resetRequester}
            className="healup-card-soft mt-5 rounded-full px-5 py-2.5 text-sm font-semibold text-matcha-700 transition-colors hover:bg-matcha-100"
          >
            {t('sendAnotherLater', language)}
          </button>
        </StateView>
      );
    }

    return (
      <div className="healup-card rounded-[32px] px-5 py-9 sm:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-matcha-600">{t('painPulse', language)}</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{t('imHere', language)}</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-gray-600 sm:text-base">
            {t('letOthersKnow', language)}
          </p>
        </div>

        <PulseCircle
          label={requestState === 'sending' ? t('sendingLabel', language) : t('tapLabel', language)}
          sublabel={requestState === 'sending' ? t('quietPulseInMotion', language) : t('pressToSendPulse', language)}
          onClick={handleSendPulse}
          disabled={requestState === 'sending'}
          isSending={requestState === 'sending'}
        />

        <div className="text-center">
          <p className="text-base font-medium text-matcha-700">
            {requestState === 'sending' ? t('sendingRequest', language) : t('gentleSignal', language)}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {requestState === 'sending'
              ? t('communitySees', language)
              : t('nearbySupporters', language)}
          </p>
        </div>
      </div>
    );
  };

  const renderResponderContent = () => {
    if (responseState === 'sent') {
      return (
        <StateView
          eyebrow={t('anonymousSupport', language)}
          title={t('supportSent', language)}
          description={t('theyKnowYoure', language)}
        >
          <div className="healup-card-soft rounded-[24px] p-5 text-sm text-gray-700">
            <p className="font-semibold text-matcha-700">{t('yourNote', language)}</p>
            <p className="mt-2 leading-relaxed">{selectedEmoji} {supportMessage}</p>
          </div>
          <button
            type="button"
            onClick={resetResponder}
            className="healup-card-soft mt-5 rounded-full px-5 py-2.5 text-sm font-semibold text-matcha-700 transition-colors hover:bg-matcha-100"
          >
            {t('sendSupportAgain', language)}
          </button>
        </StateView>
      );
    }

    return (
      <StateView
        eyebrow={t('anonymousSupport', language)}
        title={t('beQuietPresence', language)}
        description={t('someoneHurting', language)}
      >
        <div className="healup-card-soft rounded-[30px] p-6">
          <div>
            <p className="text-sm font-semibold text-gray-800">{t('chooseSupportiveNote', language)}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {presetMessages.map((preset) => {
                const isSelected = supportMessage === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setSupportMessage(preset)}
                    className={`rounded-full border px-3 py-2 text-sm transition-colors ${
                      isSelected
                        ? 'border-matcha-200 bg-matcha-100 text-matcha-800'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-matcha-100 hover:bg-matcha-50'
                    }`}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5">
            <label className="block text-sm font-semibold text-gray-800" htmlFor="pain-pulse-support-message">
              {t('orWriteShortMessage', language)}
            </label>
            <textarea
              id="pain-pulse-support-message"
              value={supportMessage}
              onChange={(e) => setSupportMessage(e.target.value.slice(0, 120))}
              rows={3}
              placeholder={t('writeSomethingGentle', language)}
              className="mt-3 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition-all focus:border-matcha-300 focus:ring-2 focus:ring-matcha-100"
            />
            <p className="mt-2 text-xs text-gray-400">{supportMessage.length}/120 {t('charactersLabel', language)}</p>
          </div>

          <div className="mt-5">
            <p className="text-sm font-semibold text-gray-800">{t('addQuietEmoji', language)}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {RESPONSE_EMOJIS.map((emoji) => {
                const isSelected = selectedEmoji === emoji;
                return (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl border text-lg transition-colors ${
                      isSelected
                        ? 'border-matcha-200 bg-matcha-100 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-matcha-100 hover:bg-matcha-50'
                    }`}
                    aria-label={`${emoji}`}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="healup-card mt-5 rounded-[24px] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-matcha-600">{t('previewLabel', language)}</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">
              {selectedEmoji} {supportMessage || t('quietNoteAppear', language)}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSendSupport}
            disabled={responseState === 'sending' || !supportMessage.trim()}
            className={`
              mt-5 flex w-full items-center justify-center gap-2 rounded-[24px] px-5 py-4 text-base font-semibold text-white shadow-lg transition-all
              ${responseState === 'sending'
                ? 'bg-matcha-500/80'
                : 'bg-gradient-to-r from-matcha-600 to-matcha-500 hover:from-matcha-700 hover:to-matcha-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50'}
            `}
          >
            <HeartHandshake size={18} />
            {responseState === 'sending' ? t('sendingDots', language) : t('tapToSendSupport', language)}
          </button>
          <p className="mt-3 text-center text-sm text-gray-500">{t('supportAnonymous', language)}</p>
        </div>
      </StateView>
    );
  };

  return (
    <div className="healup-reveal relative min-h-[calc(100vh-140px)] overflow-hidden rounded-[36px] bg-gradient-to-br from-matcha-50 via-[#f5f0e6] to-[#eef3e8] p-5 shadow-sm ring-1 ring-matcha-100 sm:p-8">
      <div className="relative mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('painPulse', language)}</h1>
            <p className="text-gray-500">{t('painPulseSubtitle', language)}</p>
          </div>
          <div className="healup-card inline-flex w-fit rounded-full p-1">
            <button
              type="button"
              onClick={() => setMode('request')}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                mode === 'request' ? 'bg-[#fffdf9] text-matcha-700 shadow-sm' : 'text-gray-500'
              }`}
            >
              {t('needSupportTab', language)}
            </button>
            <button
              type="button"
              onClick={() => setMode('respond')}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                mode === 'respond' ? 'bg-[#fffdf9] text-matcha-700 shadow-sm' : 'text-gray-500'
              }`}
            >
              {t('sendSupportTab', language)}
            </button>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div>{mode === 'request' ? renderRequesterContent() : renderResponderContent()}</div>

          <aside className="space-y-4">
            <StateView
              eyebrow={t('howItWorks', language)}
              title={t('quietByDesign', language)}
              description={t('painPulseMinimal', language)}
            >
              <div className="space-y-3 text-sm text-gray-600">
                <div className="healup-card-soft flex items-start gap-3 rounded-[24px] p-4">
                  <Sparkles size={16} className="mt-0.5 text-matcha-600" />
                  <p>{t('noNamesNoComments', language)}</p>
                </div>
                <div className="healup-card-soft flex items-start gap-3 rounded-[24px] p-4">
                  <Sparkles size={16} className="mt-0.5 text-matcha-600" />
                  <p>{t('liveSupportResponses', language)}</p>
                </div>
              </div>
            </StateView>

            <div className="healup-card-soft rounded-[30px] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-matcha-600">{t('supportSnapshot', language)}</p>
              <p className="mt-3 text-sm font-semibold text-matcha-800">{t('noEntriesYet', language)}</p>
              <p className="mt-1 text-sm text-gray-500">{t('supportActivityAppear', language)}</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default PainPulse;
