import React, { useEffect, useRef, useState } from 'react';
import {
  Mail,
  KeyRound,
  ArrowLeft,
  Loader2,
  Shield,
  Copy,
  Check,
  AlertTriangle,
} from 'lucide-react';
import {
  signupOrLoginWithEmail,
  verifyEmailCode,
  onNewRecoveryKey,
  onRecoveryRequest,
} from '../services/cardinal';

type Mode =
  | 'choose'
  | 'enterEmail'
  | 'enterCode'
  | 'enterRecoveryKey'
  | 'showNewRecoveryKey';
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

  const [recoveryKeyInput, setRecoveryKeyInput] = useState('');
  const [recoveryResolveRef, setRecoveryResolveRef] = useState<{
    fn: (keys: string[] | null) => void;
  } | null>(null);
  const [newRecoveryKey, setNewRecoveryKey] = useState<string | null>(null);
  const newRecoveryKeyRef = useRef<string | null>(null);
  const recoveryCancelledRef = useRef(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    onNewRecoveryKey((key) => {
      if (key) {
        newRecoveryKeyRef.current = key;
        setNewRecoveryKey(key);
      }
    });
    onRecoveryRequest((request, resolve) => {
      if (request === null) {
        setRecoveryResolveRef(null);
        return;
      }
      setRecoveryResolveRef({ fn: resolve });
      setRecoveryKeyInput('');
      setError(null);
      setMode('enterRecoveryKey');
      setIsLoading(false);
    });
  }, []);

  const handleChoose = (chosenIntent: Intent) => {
    setIntent(chosenIntent);
    setMode('enterEmail');
    setError(null);
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      await signupOrLoginWithEmail(email.trim());
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

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter the code from your email.');
      return;
    }

    setError(null);
    setIsLoading(true);
    newRecoveryKeyRef.current = null;
    setNewRecoveryKey(null);
    recoveryCancelledRef.current = false;

    try {
      await verifyEmailCode(code.trim());
      if (newRecoveryKeyRef.current) {
        setMode('showNewRecoveryKey');
      } else {
        onAuthSuccess();
      }
    } catch (err) {
      console.error('Verification failed:', err);
      const msg = err instanceof Error ? err.message : '';
      const isKeyError = /verified key|crypto strategies/i.test(msg);

      if (recoveryCancelledRef.current) {
        setError(
          "This account's encrypted data can only be opened with its recovery key. To start fresh, sign up with a different email."
        );
        setMode('enterEmail');
        setEmail('');
        setCode('');
        setIntent('signup');
      } else {
        setError(
          isKeyError
            ? "We couldn't unlock your account with that recovery key. Please request a new code and try again."
            : msg || "That code didn't work. Please try again."
        );
        setMode('enterEmail');
        setCode('');
      }
      recoveryCancelledRef.current = false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitRecoveryKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryKeyInput.trim()) {
      setError('Please enter your recovery key.');
      return;
    }
    if (!recoveryResolveRef) return;

    const keys = recoveryKeyInput
      .trim()
      .split(/\r?\n+/)
      .map((k) => k.trim())
      .filter(Boolean);

    setError(null);
    setIsLoading(true);
    const resolve = recoveryResolveRef.fn;
    setRecoveryResolveRef(null);
    resolve(keys);
  };

  const handleCancelRecovery = () => {
    if (!recoveryResolveRef) return;
    const resolve = recoveryResolveRef.fn;
    setRecoveryResolveRef(null);
    recoveryCancelledRef.current = true;
    setIsLoading(true);
    resolve(null);
  };

  const handleCopyRecoveryKey = async () => {
    if (!newRecoveryKey) return;
    try {
      await navigator.clipboard.writeText(newRecoveryKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  };

  const handleConfirmRecoveryKeySaved = () => {
    setNewRecoveryKey(null);
    newRecoveryKeyRef.current = null;
    onAuthSuccess();
  };

  const handleBack = () => {
    setError(null);
    if (mode === 'enterCode') setMode('enterEmail');
    else if (mode === 'enterEmail') setMode('choose');
  };

  if (mode === 'choose') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#fbf8f1]">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-matcha-100 mb-4">
              <svg
                width="40"
                height="40"
                viewBox="0 0 34 34"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="HealUp logo"
              >
                <path
                  d="M10 4C10 2.34315 11.3431 1 13 1H21C22.6569 1 24 2.34315 24 4V10H30C31.6569 10 33 11.3431 33 13V21C33 22.6569 31.6569 24 30 24H24V30C24 31.6569 22.6569 33 21 33H13C11.3431 33 10 31.6569 10 30V24H4C2.34315 24 1 22.6569 1 21V13C1 11.3431 2.34315 10 4 10H10V4Z"
                  fill="#7ea96b"
                />
                <path
                  d="M12 22L24 10M24 10H16M24 10V18"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
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

  if (mode === 'enterRecoveryKey') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#fbf8f1]">
        <form onSubmit={handleSubmitRecoveryKey} className="w-full max-w-md">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-matcha-100 mb-4">
              <Shield size={22} className="text-matcha-700" />
            </div>
            <h1 className="text-2xl font-semibold text-matcha-900 mb-2">
              Unlock your encrypted data
            </h1>
            <p className="text-gray-600">
              This account already has encrypted data. Enter the recovery key
              you saved when you first signed up to unlock it on this device.
            </p>
          </div>

          <div className="healup-card rounded-[28px] p-6">
            <label className="block">
              <span className="text-sm font-medium text-matcha-800 flex items-center gap-2 mb-2">
                <KeyRound size={16} /> Recovery key
              </span>
              <textarea
                value={recoveryKeyInput}
                onChange={(e) => setRecoveryKeyInput(e.target.value)}
                placeholder="ABCD-EFGH-IJKL-MNOP-QRST-UVWX-YZ23-4567-ABCD-EFGH-IJKL-MNOP-QRST"
                autoFocus
                disabled={isLoading}
                rows={4}
                className="w-full rounded-2xl border border-matcha-100 bg-white px-4 py-3 text-base font-mono tracking-wider focus:outline-none focus:border-matcha-400 resize-none"
              />
              <span className="mt-2 block text-xs text-gray-500">
                If you have more than one recovery key, put each on its own line.
              </span>
            </label>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-5 w-full min-h-[52px] rounded-2xl bg-matcha-600 text-white font-semibold transition-colors hover:bg-matcha-700 disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="animate-spin" size={18} />}
              {isLoading ? 'Unlocking…' : 'Unlock my account'}
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="flex items-start gap-2">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold mb-1">Lost your recovery key?</p>
                <p className="mb-2">
                  Without it, your previously encrypted data can't be opened on
                  this device. Cancel and use a different email to start fresh.
                </p>
                <button
                  type="button"
                  onClick={handleCancelRecovery}
                  disabled={isLoading}
                  className="text-amber-900 underline hover:text-amber-700 disabled:opacity-60"
                >
                  Cancel and start over
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  if (mode === 'showNewRecoveryKey' && newRecoveryKey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#fbf8f1]">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-matcha-100 mb-4">
              <Shield size={22} className="text-matcha-700" />
            </div>
            <h1 className="text-2xl font-semibold text-matcha-900 mb-2">
              Save your recovery key
            </h1>
            <p className="text-gray-600">
              You'll need this key to unlock your data on a new device or
              browser. We can't show it to you again — store it somewhere safe
              now.
            </p>
          </div>

          <div className="healup-card rounded-[28px] p-6">
            <div className="rounded-2xl border border-matcha-200 bg-matcha-50/60 p-4 font-mono text-sm tracking-wider text-matcha-900 break-all select-all">
              {newRecoveryKey}
            </div>

            <button
              type="button"
              onClick={handleCopyRecoveryKey}
              className="mt-3 w-full min-h-[44px] rounded-2xl border border-matcha-200 bg-white text-matcha-800 font-semibold transition-colors hover:bg-matcha-50 inline-flex items-center justify-center gap-2"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied' : 'Copy to clipboard'}
            </button>

            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <div className="flex items-start gap-2">
                <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                <p>
                  Anyone with this key can decrypt your health data. Treat it
                  like a password — store it in a password manager or print it
                  out.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirmRecoveryKeySaved}
              className="mt-5 w-full min-h-[52px] rounded-2xl bg-matcha-600 text-white font-semibold transition-colors hover:bg-matcha-700"
            >
              I've saved it — continue
            </button>
          </div>
        </div>
      </div>
    );
  }

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
