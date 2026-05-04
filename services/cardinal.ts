// services/cardinal.ts
// Handles all Cardinal SDK interactions: connection, signup, login, logout

import {
  CardinalSdk,
  AuthenticationMethod,
  CaptchaOptions,
  AuthenticationProcessTelecomType,
  StorageFacade,
} from '@icure/cardinal-sdk';

// -------------------------------------------------------------------------
// Configuration (read from .env.local / Vercel environment variables)
// -------------------------------------------------------------------------
const config = {
  apiUrl: import.meta.env.VITE_CARDINAL_API_URL,
  msgGwUrl: import.meta.env.VITE_CARDINAL_MSG_GW_URL,
  externalServicesId: import.meta.env.VITE_CARDINAL_EXTERNAL_SERVICES_ID,
  emailAuthProcessId: import.meta.env.VITE_CARDINAL_EMAIL_AUTH_PROCESS_ID,
  parentOrgId: import.meta.env.VITE_CARDINAL_PARENT_ORG_ID,
  projectId: import.meta.env.VITE_CARDINAL_PROJECT_ID,
};

// -------------------------------------------------------------------------
// In-memory holders for the current session
// -------------------------------------------------------------------------
let activeSdk: CardinalSdk | null = null;
let pendingSignupStep: CardinalSdk.AuthenticationWithProcessStep | null = null;

// -------------------------------------------------------------------------
// Utility: confirm config is loaded (called once at app startup)
// -------------------------------------------------------------------------
export function checkCardinalConfig(): boolean {
  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.error('❌ Cardinal config missing values for:', missing);
    return false;
  }

  console.log('✅ Cardinal config loaded successfully');
  console.log('Connected to:', config.apiUrl);
  console.log('Project ID:', config.projectId);
  return true;
}

// -------------------------------------------------------------------------
// SIGN UP — Step 1: send a verification code to the user's email
// -------------------------------------------------------------------------
export async function startEmailSignup(email: string): Promise<void> {
  console.log('📧 Starting email signup for:', email);

  const step = await CardinalSdk.initializeWithProcess(
    config.projectId,
    config.apiUrl,
    config.msgGwUrl,
    config.externalServicesId,
    config.emailAuthProcessId,
    AuthenticationProcessTelecomType.Email,
    email,
    new CaptchaOptions.Kerberus.Delegated({}),
    StorageFacade.usingBrowserLocalStorage(),
  );

  pendingSignupStep = step;
  console.log('✅ Verification code sent to', email);
}

// -------------------------------------------------------------------------
// SIGN UP — Step 2: user enters the code from their email
// -------------------------------------------------------------------------
export async function completeEmailSignup(code: string): Promise<CardinalSdk> {
  if (!pendingSignupStep) {
    throw new Error('No signup in progress. Please start signup first.');
  }

  console.log('🔑 Verifying code...');
  const sdk = await pendingSignupStep.completeAuthentication(code);

  activeSdk = sdk;
  pendingSignupStep = null;
  console.log('✅ Signup complete, user authenticated');
  return sdk;
}

// -------------------------------------------------------------------------
// LOG IN — for returning users (uses same email-code flow)
// -------------------------------------------------------------------------
export async function startEmailLogin(email: string): Promise<void> {
  // Cardinal uses the same process for signup + login
  // (it figures out automatically if the user exists)
  return startEmailSignup(email);
}

export async function completeEmailLogin(code: string): Promise<CardinalSdk> {
  return completeEmailSignup(code);
}

// -------------------------------------------------------------------------
// LOG OUT
// -------------------------------------------------------------------------
export async function logout(): Promise<void> {
  if (activeSdk) {
    activeSdk.close();
    activeSdk = null;
    console.log('👋 Logged out');
  }
  // Clear stored keys/tokens from browser
  // (We may need to clear specific localStorage keys here later)
}

// -------------------------------------------------------------------------
// Helper: get the current SDK (throws if not logged in)
// -------------------------------------------------------------------------
export function getActiveSdk(): CardinalSdk {
  if (!activeSdk) {
    throw new Error('Not logged in. Please log in first.');
  }
  return activeSdk;
}

export function isLoggedIn(): boolean {
  return activeSdk !== null;
}

// Export config for use in other places if needed
export { config as cardinalConfig };