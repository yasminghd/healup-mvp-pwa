import React, { useState } from 'react';
import { Leaf, Mail, KeyRound, ArrowLeft, Loader2 } from 'lucide-react';
import {
  startEmailSignup,
  startEmailLogin,
  completeEmailSignup,
} from '../services/cardinal';

type Mode = 'choose' | 'enterEmail' | 'enterCode';
type Intent = 'signup' | 'login';

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<Mode>('choose');
  const [intent, setIntent] = useState<Intent>('signup');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ----- Step 1: choose Sign Up vs Log In -----
  const handleChoose = (chosenIntent: Intent) => {
    setIntent(chosenIntent);
    setMode('enterEmail');
    setError(null);
  };

  // ----- Step 2: send verification code -----
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      if (intent === 'signup') {
        await startEmailSignup(email.trim());
      } else {
        await startEmailLogin(email.trim());
      }
      setMode('enterCode');
    } catch (err) {
      console.error('Send code failed:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Could not send the code. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ----- Step 3: verify the code -----
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter the code from your email.');
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      await completeEmailSignup(code.trim());
      onAuthSuccess();
    } catch (err) {
      console.error('Verification failed:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'That code didn\'t work. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ----- Go back to previous step -----
  const handleBack = () => {
    setError(null);
    if (mode === 'enterCode') setMode('enterEmail');
    else if (mode === 'enterEmail') setMode('choose');
  };

  // ===== SCREEN 1: choose signup or login =====
  if (mode === 'choose') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#fbf8f1]">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-matcha-100 mb-4">
              <Leaf className="text-matcha-700" size={32} />
            </div>
            <h1 className="text-3xl font-semibold text-matcha-900 mb-2">
              Welcome to HealUp
            </h1>
            <p className="text-gray-600">
              Your gentle space for autoimmune health.
            </p>
          </div>

          <div className="healup-card rounded-[28px] p-6 space-y-3">
            <button
              type="button"
              onClick={() => handleChoose('signup')}
              className="w-full min-h-[52px] rounded-2xl bg-matcha-600 text-white font-semibold transition-colors hover:bg-matcha-700"
            >
              Create an account
            </button>
            <button
              type="button"
              onClick={() => handleChoose('login')}
              className="w-full min-h-[52px] rounded-2xl border border-matcha-200 bg-white text-matcha-800 font-semibold transition-colors hover:bg-matcha-50"
            >
              I already have an account
            </button>
          </div>

          <p className="text-center text-xs text-gray-500 mt-6">
            Your data is end-to-end encrypted.
          </p>
        </div>
      </div>
    );
  }

  // ===== SCREEN 2: enter email =====
  if (mode === 'enterEmail') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#fbf8f1]">
        <form onSubmit={handleSendCode} className="w-full max-w-md">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-matcha-700 mb-6 hover:text-matcha-900"
          >
            <ArrowLeft size={18} /> Back
          </button>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-matcha-900 mb-2">
              {intent === 'signup' ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-gray-600">
              We'll send a 6-digit code to your email.
            </p>
          </div>

          <div className="healup-card rounded-[28px] p-6">
            <label className="block">
              <span className="text-sm font-medium text-matcha-800 flex items-center gap-2 mb-2">
                <Mail size={16} /> Email address
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
                disabled={isLoading}
                className="w-full min-h-[52px] rounded-2xl border border-matcha-100 bg-white px-4 text-base focus:outline-none focus:border-matcha-400"
              />
            </label>

            {error && (
              <p className="mt-3 text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-5 w-full min-h-[52px] rounded-2xl bg-matcha-600 text-white font-semibold transition-colors hover:bg-matcha-700 disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="animate-spin" size={18} />}
              {isLoading ? 'Sending…' : 'Send me a code'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ===== SCREEN 3: enter code =====
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#fbf8f1]">
      <form onSubmit={handleVerifyCode} className="w-full max-w-md">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-matcha-700 mb-6 hover:text-matcha-900"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-matcha-900 mb-2">
            Check your email
          </h1>
          <p className="text-gray-600">
            We sent a code to <span className="font-medium">{email}</span>.
          </p>
        </div>

        <div className="healup-card rounded-[28px] p-6">
          <label className="block">
            <span className="text-sm font-medium text-matcha-800 flex items-center gap-2 mb-2">
              <KeyRound size={16} /> Verification code
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              autoComplete="one-time-code"
              autoFocus
              disabled={isLoading}
              className="w-full min-h-[52px] rounded-2xl border border-matcha-100 bg-white px-4 text-base tracking-widest focus:outline-none focus:border-matcha-400"
            />
          </label>

          {error && (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-5 w-full min-h-[52px] rounded-2xl bg-matcha-600 text-white font-semibold transition-colors hover:bg-matcha-700 disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="animate-spin" size={18} />}
            {isLoading ? 'Verifying…' : 'Verify and continue'}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Didn't get a code?{' '}
          <button
            type="button"
            onClick={() => { setMode('enterEmail'); setCode(''); setError(null); }}
            className="text-matcha-700 underline hover:text-matcha-900"
          >
            Try again
          </button>
        </p>
      </form>
    </div>
  );
};

export default AuthScreen;