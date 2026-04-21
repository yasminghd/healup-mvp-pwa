import React, { useEffect, useMemo, useState } from 'react';
import { Heart, HeartHandshake, Sparkles } from 'lucide-react';
import PulseCircle from './painPulse/PulseCircle';
import StateView from './painPulse/StateView';
import SupportCard from './painPulse/SupportCard';

type PulseMode = 'request' | 'respond';
type RequestState = 'idle' | 'sending' | 'received';
type ResponseState = 'idle' | 'sending' | 'sent';

const SUPPORT_MESSAGES = [
  'Sending you strength',
  "We're here for you.",
  'Holding a little calm for you today.',
];

const RESPONSE_PRESETS = [
  'Sending you strength',
  'Take it one breath at a time',
  "You're held right now",
  'Soft support coming your way',
];

const RESPONSE_EMOJIS = ['🤍', '🌿', '🫶', '💚', '✨'];

const PainPulse: React.FC = () => {
  const [mode, setMode] = useState<PulseMode>('request');
  const [requestState, setRequestState] = useState<RequestState>('idle');
  const [responseState, setResponseState] = useState<ResponseState>('idle');
  const [supportCount, setSupportCount] = useState(14);
  const [supportMessage, setSupportMessage] = useState(RESPONSE_PRESETS[0]);
  const [selectedEmoji, setSelectedEmoji] = useState(RESPONSE_EMOJIS[0]);

  useEffect(() => {
    if (requestState !== 'sending') {
      return;
    }

    // TODO: Replace with realtime pulse-request API + websocket subscription.
    const timer = window.setTimeout(() => {
      setSupportCount(14);
      setRequestState('received');
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [requestState]);

  useEffect(() => {
    if (responseState !== 'sending') {
      return;
    }

    // TODO: Replace with support-response API mutation and optimistic acknowledgement.
    const timer = window.setTimeout(() => {
      setResponseState('sent');
    }, 1100);

    return () => window.clearTimeout(timer);
  }, [responseState]);

  const supportCards = useMemo(() => {
    return SUPPORT_MESSAGES.map((message) => <SupportCard key={message} message={message} />);
  }, []);

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
    setSupportCount(14);
  };

  const resetResponder = () => {
    setResponseState('idle');
    setSupportMessage(RESPONSE_PRESETS[0]);
    setSelectedEmoji(RESPONSE_EMOJIS[0]);
  };

  const renderRequesterContent = () => {
    if (requestState === 'received') {
      return (
        <StateView
          eyebrow="Pain Pulse"
          title="You're Not Alone"
          description={`${supportCount} people are with you right now.`}
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{supportCards}</div>
          <button
            type="button"
            onClick={resetRequester}
            className="healup-card-soft mt-5 rounded-full px-5 py-2.5 text-sm font-semibold text-matcha-700 transition-colors hover:bg-matcha-100"
          >
            Send another pulse later
          </button>
        </StateView>
      );
    }

    return (
      <div className="healup-card rounded-[32px] px-5 py-9 sm:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-matcha-600">Pain Pulse</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">I&apos;m Here</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-gray-600 sm:text-base">
            Let others know you&apos;re in pain right now.
          </p>
        </div>

        <PulseCircle
          label={requestState === 'sending' ? 'Sending' : 'Tap'}
          sublabel={requestState === 'sending' ? 'Quiet pulse in motion' : 'Press to send a pain pulse'}
          onClick={handleSendPulse}
          disabled={requestState === 'sending'}
          isSending={requestState === 'sending'}
        />

        <div className="text-center">
          <p className="text-base font-medium text-matcha-700">
            {requestState === 'sending' ? 'Sending support request...' : 'A gentle signal. No feed, no comments, no noise.'}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {requestState === 'sending'
              ? 'The community will only see that someone needs quiet support right now.'
              : 'When you press the circle, nearby supporters can respond anonymously.'}
          </p>
        </div>
      </div>
    );
  };

  const renderResponderContent = () => {
    if (responseState === 'sent') {
      return (
        <StateView
          eyebrow="Anonymous Support"
          title="Support Sent"
          description="They know you're with them."
        >
          <div className="healup-card-soft rounded-[24px] p-5 text-sm text-gray-700">
            <p className="font-semibold text-matcha-700">Your note</p>
            <p className="mt-2 leading-relaxed">{selectedEmoji} {supportMessage}</p>
          </div>
          <button
            type="button"
            onClick={resetResponder}
            className="healup-card-soft mt-5 rounded-full px-5 py-2.5 text-sm font-semibold text-matcha-700 transition-colors hover:bg-matcha-100"
          >
            Send support again
          </button>
        </StateView>
      );
    }

    return (
      <StateView
        eyebrow="Anonymous Support"
        title="Be a quiet presence"
        description="Someone in the community is hurting right now. You can send a calm signal of support without exposing your identity."
      >
        <div className="healup-card-soft rounded-[30px] p-6">
          <div>
            <p className="text-sm font-semibold text-gray-800">Choose a supportive note</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {RESPONSE_PRESETS.map((preset) => {
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
              Or write a short message
            </label>
            <textarea
              id="pain-pulse-support-message"
              value={supportMessage}
              onChange={(e) => setSupportMessage(e.target.value.slice(0, 120))}
              rows={3}
              placeholder="Write something gentle and encouraging..."
              className="mt-3 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition-all focus:border-matcha-300 focus:ring-2 focus:ring-matcha-100"
            />
            <p className="mt-2 text-xs text-gray-400">{supportMessage.length}/120 characters</p>
          </div>

          <div className="mt-5">
            <p className="text-sm font-semibold text-gray-800">Add a quiet emoji</p>
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
                    aria-label={`Choose ${emoji}`}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="healup-card mt-5 rounded-[24px] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-matcha-600">Preview</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">
              {selectedEmoji} {supportMessage || 'Your quiet note will appear here.'}
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
            {responseState === 'sending' ? 'Sending...' : 'Tap to Send Support'}
          </button>
          <p className="mt-3 text-center text-sm text-gray-500">Your support is anonymous.</p>
        </div>
      </StateView>
    );
  };

  return (
    <div className="healup-reveal relative min-h-[calc(100vh-140px)] overflow-hidden rounded-[36px] bg-gradient-to-br from-matcha-50 via-[#f5f0e6] to-[#eef3e8] p-5 shadow-sm ring-1 ring-matcha-100 sm:p-8">
      <div className="relative mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pain Pulse</h1>
            <p className="text-gray-500">A quiet way to ask for support or send it back.</p>
          </div>
          <div className="healup-card inline-flex w-fit rounded-full p-1">
            <button
              type="button"
              onClick={() => setMode('request')}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                mode === 'request' ? 'bg-[#fffdf9] text-matcha-700 shadow-sm' : 'text-gray-500'
              }`}
            >
              Need support
            </button>
            <button
              type="button"
              onClick={() => setMode('respond')}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                mode === 'respond' ? 'bg-[#fffdf9] text-matcha-700 shadow-sm' : 'text-gray-500'
              }`}
            >
              Send support
            </button>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div>{mode === 'request' ? renderRequesterContent() : renderResponderContent()}</div>

          <aside className="space-y-4">
            <StateView
              eyebrow="How it works"
              title="Quiet by design"
              description="Pain Pulse is intentionally minimal. It avoids public posting and keeps support soft, immediate, and anonymous."
            >
              <div className="space-y-3 text-sm text-gray-600">
                <div className="healup-card-soft flex items-start gap-3 rounded-[24px] p-4">
                  <Sparkles size={16} className="mt-0.5 text-matcha-600" />
                  <p>No names, no comments, and no visible reactions beyond calm support.</p>
                </div>
                <div className="healup-card-soft flex items-start gap-3 rounded-[24px] p-4">
                  <Sparkles size={16} className="mt-0.5 text-matcha-600" />
                  <p>The interaction flow is mocked locally for now, ready to connect to realtime APIs later.</p>
                </div>
              </div>
            </StateView>

            <div className="healup-card-soft rounded-[30px] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-matcha-600">Support Snapshot</p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">{supportCount}</p>
              <p className="mt-1 text-sm text-gray-500">quiet signals available in the current mock session</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default PainPulse;
