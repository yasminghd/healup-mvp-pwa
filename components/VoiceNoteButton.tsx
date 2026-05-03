import React, { useEffect, useRef, useState } from 'react';
import { Mic, Square } from 'lucide-react';
import { t } from '../translations';

type RecState = 'idle' | 'listening' | 'denied' | 'unsupported';

interface VoiceNoteButtonProps {
  language: string;
  onTranscript: (text: string) => void;
}

const localeFor = (language: string): string => {
  switch (language) {
    case 'French': return 'fr-FR';
    case 'German': return 'de-DE';
    case 'Italian': return 'it-IT';
    case 'Romansh': return 'rm-CH';
    default: return 'en-US';
  }
};

const VoiceNoteButton: React.FC<VoiceNoteButtonProps> = ({ language, onTranscript }) => {
  const [state, setState] = useState<RecState>('idle');
  const [interim, setInterim] = useState('');
  const recognitionRef = useRef<any>(null);
  const onTranscriptRef = useRef(onTranscript);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setState('unsupported');
      return;
    }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = localeFor(language);

    rec.onresult = (event: any) => {
      let interimText = '';
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }
      if (finalText.trim()) {
        onTranscriptRef.current(finalText.trim());
      }
      setInterim(interimText);
    };
    rec.onerror = (event: any) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setState('denied');
      } else {
        setState('idle');
      }
    };
    rec.onend = () => {
      setState((current) => (current === 'denied' ? current : 'idle'));
      setInterim('');
    };

    recognitionRef.current = rec;
    return () => {
      try { rec.onresult = null; rec.onerror = null; rec.onend = null; rec.stop(); } catch {
        // ignored
      }
      recognitionRef.current = null;
    };
  }, [language]);

  const handleToggle = () => {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (state === 'listening') {
      try { rec.stop(); } catch { /* ignored */ }
      return;
    }
    try {
      rec.start();
      setState('listening');
    } catch {
      // start() while already listening throws — safe to ignore
    }
  };

  if (state === 'unsupported') {
    return null;
  }

  const isListening = state === 'listening';

  return (
    <div
      className={`mb-8 rounded-[28px] border p-5 transition-colors ${
        isListening
          ? 'border-matcha-300 bg-matcha-50/80'
          : 'border-matcha-100 bg-[linear-gradient(180deg,#fffdf9_0%,#f4ebd8_100%)]'
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={handleToggle}
          aria-pressed={isListening}
          aria-label={isListening ? t('voiceStop', language) : t('voiceTapToSpeak', language)}
          className={`relative inline-flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-[1.03] focus:outline-none focus:ring-4 focus:ring-matcha-200 ${
            isListening
              ? 'bg-gradient-to-br from-matcha-700 to-matcha-500'
              : 'bg-gradient-to-br from-matcha-600 to-matcha-500'
          }`}
        >
          {isListening && (
            <>
              <span className="absolute inset-0 rounded-full bg-matcha-400/40 animate-ping" aria-hidden="true" />
              <span className="absolute -inset-2 rounded-full border-2 border-matcha-300/60 animate-pulse" aria-hidden="true" />
            </>
          )}
          {isListening ? <Square size={26} fill="currentColor" /> : <Mic size={30} />}
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-matcha-800">
            {isListening ? t('voiceListening', language) : t('voiceCardTitle', language)}
          </p>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            {state === 'denied'
              ? t('voicePermissionNeeded', language)
              : isListening
                ? interim || t('voiceLiveHint', language)
                : t('voiceCardSubtitle', language)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoiceNoteButton;
