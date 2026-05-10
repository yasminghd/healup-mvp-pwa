// services/cardinal.ts
// Cardinal SDK auth — based on the official Cardinal React template, adapted for HealUp.

import {
  AuthenticationMethod,
  AuthenticationProcessTelecomType,
  CaptchaOptions,
  CardinalApis,
  CardinalBaseSdk,
  CardinalSdk,
  CryptoStrategies,
  DataOwnerWithType,
  KeyPairRecoverer,
  KeypairFingerprintV1String,
  RecoveryDataKey,
  RecoveryDataUseFailureReason,
  RecoveryKeyOptions,
  RecoveryKeySize,
  RecoveryResult,
  Solution,
  SpkiHexString,
  StorageFacade,
  UserGroup,
  XCryptoService,
  XRsaKeypair,
  spkiHexKeyToFingerprintV1,
} from '@icure/cardinal-sdk';

// -------------------------------------------------------------------------
// Configuration
// -------------------------------------------------------------------------
const config = {
  apiUrl: import.meta.env.VITE_CARDINAL_API_URL,
  msgGwUrl: import.meta.env.VITE_CARDINAL_MSG_GW_URL,
  externalServicesId: import.meta.env.VITE_CARDINAL_EXTERNAL_SERVICES_ID,
  emailAuthProcessId: import.meta.env.VITE_CARDINAL_EMAIL_AUTH_PROCESS_ID,
  parentOrgId: import.meta.env.VITE_CARDINAL_PARENT_ORG_ID,
  projectId: import.meta.env.VITE_CARDINAL_PROJECT_ID,
};

const REMEMBER_ME_TOKEN_VALIDITY_SECONDS = 30 * 24 * 3600;
const SAVED_CREDENTIALS_KEY = 'healup-saved-credentials';

// -------------------------------------------------------------------------
// In-memory state
// -------------------------------------------------------------------------
let activeSdk: CardinalSdk | null = null;
let pendingAuthStep: CardinalBaseSdk.BaseAuthenticationWithProcessStep | null = null;
let pendingEmail: string | null = null;
let verifyInFlight: Promise<CardinalSdk> | null = null;

type NewRecoveryKeyListener = (key: string | null) => void;
type RecoveryRequestListener = (
  request: { reasons: string[] } | null,
  resolve: (keys: string[] | null) => void
) => void;

let newRecoveryKeyListener: NewRecoveryKeyListener | null = null;
let recoveryRequestListener: RecoveryRequestListener | null = null;

export function onNewRecoveryKey(listener: NewRecoveryKeyListener) {
  newRecoveryKeyListener = listener;
}
export function onRecoveryRequest(listener: RecoveryRequestListener) {
  recoveryRequestListener = listener;
}

// -------------------------------------------------------------------------
// Saved credentials
// -------------------------------------------------------------------------
interface SavedCredentials {
  login: string;
  token: string;
  tokenTimestamp: number;
  email: string;
}

function loadSavedCredentials(): SavedCredentials | null {
  try {
    const raw = localStorage.getItem(SAVED_CREDENTIALS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveSavedCredentials(creds: SavedCredentials) {
  localStorage.setItem(SAVED_CREDENTIALS_KEY, JSON.stringify(creds));
}

function clearSavedCredentials() {
  localStorage.removeItem(SAVED_CREDENTIALS_KEY);
}

// -------------------------------------------------------------------------
// Crypto strategies
// -------------------------------------------------------------------------
class HealUpCryptoStrategies extends CryptoStrategies {
  generateNewKeyForDataOwner(
    self: DataOwnerWithType,
    _cryptoPrimitives: XCryptoService,
  ): Promise<boolean | XRsaKeypair | 'keyless' | 'parent-delegator'> {
    const dataOwner = self.dataOwner;
    const hasNoKey =
      dataOwner.publicKeysForOaepWithSha256.length === 0 &&
      Object.keys(dataOwner.aesExchangeKeys).length === 0 &&
      dataOwner.publicKey == null;
    return Promise.resolve(hasNoKey);
  }

  async notifyNewKeyCreated(
    apis: CardinalApis,
    _key: XRsaKeypair,
    _cryptoPrimitives: XCryptoService,
  ): Promise<void> {
    const recoveryKey = await apis.recovery.createRecoveryInfoForAvailableKeyPairs({
      recoveryKeyOptions: new RecoveryKeyOptions.Generate({
        recoveryKeySize: RecoveryKeySize.Bytes32,
      }),
    });
    const formatted = recoveryKey.asBase32().match(/.{1,4}/g)?.join('-');
    if (formatted) {
      console.log('🔑 New recovery key generated:', formatted);
      if (newRecoveryKeyListener) newRecoveryKeyListener(formatted);
    }
  }

  async recoverAndVerifySelfHierarchyKeys(
    keysData: Array<CryptoStrategies.KeyDataRecoveryRequest>,
    _cryptoPrimitives: XCryptoService,
    keyPairRecoverer: KeyPairRecoverer,
  ): Promise<{ [dataOwnerId: string]: CryptoStrategies.RecoveredKeyData }> {
    const aggregate: { [dataOwnerId: string]: { [pub: SpkiHexString]: XRsaKeypair } } = {};

    const stillMissing = keysData.some((kd) => kd.unavailableKeys.length > 0);
    if (!stillMissing) {
      return this.buildResult(keysData, aggregate);
    }

    const reasonCount = Math.max(
      1,
      keysData.reduce((sum, kd) => sum + kd.unavailableKeys.length, 0),
    );
    const reasons = Array.from({ length: reasonCount }, () =>
      RecoveryDataUseFailureReason.Missing.toString(),
    );

    const recoveryKeys = await this.askForRecoveryKeys(reasons);
    if (recoveryKeys?.length) {
      await this.tryRecover(recoveryKeys, keyPairRecoverer, aggregate);
    }

    return this.buildResult(keysData, aggregate);
  }

  private askForRecoveryKeys(reasons: string[]): Promise<string[] | null> {
    return new Promise((resolve) => {
      if (!recoveryRequestListener) {
        resolve(null);
        return;
      }
      recoveryRequestListener({ reasons }, (keys) => resolve(keys));
    });
  }

  private async tryRecover(
    recoveryKeys: string[],
    keyPairRecoverer: KeyPairRecoverer,
    aggregate: { [dataOwnerId: string]: { [pub: SpkiHexString]: XRsaKeypair } },
  ): Promise<void> {
    for (const rk of recoveryKeys) {
      const cleaned = rk.replace(/[-\s]/g, '');
      let decoded: RecoveryDataKey | undefined;
      try {
        decoded = RecoveryDataKey.fromBase32(cleaned);
      } catch (e) {
        console.warn('Invalid recovery key, skipping:', e);
        continue;
      }
      const res = await keyPairRecoverer.recoverWithRecoveryKey(decoded, false);
      if (res instanceof RecoveryResult.Success) {
        const data = res.data;
        for (const dataOwnerId of Object.keys(data)) {
          aggregate[dataOwnerId] = aggregate[dataOwnerId] ?? {};
          for (const pub of Object.keys(data[dataOwnerId])) {
            aggregate[dataOwnerId][pub as SpkiHexString] =
              data[dataOwnerId][pub as SpkiHexString];
          }
        }
      }
    }
  }

  private buildResult(
    keysData: Array<CryptoStrategies.KeyDataRecoveryRequest>,
    aggregate: { [dataOwnerId: string]: { [pub: SpkiHexString]: XRsaKeypair } },
  ): { [dataOwnerId: string]: CryptoStrategies.RecoveredKeyData } {
    const result: { [dataOwnerId: string]: CryptoStrategies.RecoveredKeyData } = {};
    for (const req of keysData) {
      const dataOwnerId = req.dataOwnerDetails.dataOwner.id;
      const perOwner = aggregate[dataOwnerId];
      const recovered: { [fp: KeypairFingerprintV1String]: XRsaKeypair } = {};
      if (perOwner) {
        for (const unavailable of req.unavailableKeys) {
          const k = perOwner[unavailable.publicKey];
          if (k) {
            recovered[
              spkiHexKeyToFingerprintV1(unavailable.publicKey) as KeypairFingerprintV1String
            ] = k;
          }
        }
      }
      result[dataOwnerId] = { recoveredKeys: recovered, keyAuthenticity: {} };
    }
    return result;
  }
}

// -------------------------------------------------------------------------
// SDK options
// -------------------------------------------------------------------------
const groupSelector = (availableGroups: Array<UserGroup>): Promise<string> => {
  if (availableGroups.length > 1) {
    console.warn(
      `User belongs to ${availableGroups.length} groups; auto-selecting the first.`,
    );
  }
  return Promise.resolve(availableGroups[0]?.groupId ?? '');
};

const baseSdkOptions = () => ({ groupSelector });

const toFullSdkOptions = () => ({
  useHierarchicalDataOwners: false,
  cryptoStrategies: new HealUpCryptoStrategies(),
});

// -------------------------------------------------------------------------
// Public API
// -------------------------------------------------------------------------
export function checkCardinalConfig(): boolean {
  const missing = Object.entries(config)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length > 0) {
    console.error('❌ Cardinal config missing values for:', missing);
    return false;
  }
  console.log('✅ Cardinal config loaded successfully');
  console.log('Connected to:', config.apiUrl);
  console.log('Project ID:', config.projectId);
  return true;
}

export async function signupOrLoginWithEmail(
  email: string,
  firstName?: string,
  lastName?: string,
): Promise<void> {
  console.log('📧 Starting email auth for:', email);

  const captchaSolution = await resolveKerberusCaptcha();

  const step = await CardinalBaseSdk.initializeWithProcess(
    config.projectId,
    config.apiUrl,
    config.msgGwUrl,
    config.externalServicesId,
    config.emailAuthProcessId,
    AuthenticationProcessTelecomType.Email,
    email,
    new CaptchaOptions.Kerberus.Computed({ solution: captchaSolution }),
    { firstName: firstName ?? '', lastName: lastName ?? '' },
    baseSdkOptions(),
  );

  pendingAuthStep = step;
  pendingEmail = email;
  console.log('✅ Verification code sent to', email);
}

// SIGNUP / LOGIN — Step 2 with double-fire guard
export async function verifyEmailCode(code: string): Promise<CardinalSdk> {
  // Guard: if verification is already in progress, return the same promise
  // (prevents double-fire from React Strict Mode in dev)
  if (verifyInFlight) {
    console.log('⏸️  Verify already in progress, returning existing promise');
    return verifyInFlight;
  }

  if (!pendingAuthStep) {
    throw new Error('No authentication in progress.');
  }
  if (!pendingEmail) {
    throw new Error('Missing email context.');
  }

  verifyInFlight = doVerify(code);
  try {
    const sdk = await verifyInFlight;
    return sdk;
  } finally {
    verifyInFlight = null;
  }
}

async function doVerify(code: string): Promise<CardinalSdk> {
  if (!pendingAuthStep) throw new Error('No authentication in progress.');
  if (!pendingEmail) throw new Error('Missing email context.');

  const emailAtStart = pendingEmail;

  console.log('🔑 Verifying code...');
  const baseSdk = await pendingAuthStep.completeAuthentication(code);
  const sdk = await baseSdk.toFullSdk(
    StorageFacade.usingBrowserLocalStorage(),
    toFullSdkOptions(),
  );

  const user = await sdk.user.getCurrentUser();

  try {
    const longLivedToken = await sdk.user.getToken(user.id, 'rememberMe', {
      tokenValidity: REMEMBER_ME_TOKEN_VALIDITY_SECONDS,
    });
    saveSavedCredentials({
      login: `${user.groupId}/${user.id}`,
      token: longLivedToken,
      tokenTimestamp: Date.now(),
      email: emailAtStart,
    });
    console.log('💾 Saved 30-day rememberMe token');
  } catch (e) {
    console.error('Could not save long-lived token:', e);
  }

  activeSdk = sdk;
  pendingAuthStep = null;
  pendingEmail = null;
  console.log('✅ Authentication complete');
  return sdk;
}

// On app load — restore session from saved rememberMe token
export async function tryRestoreSession(): Promise<CardinalSdk | null> {
  const creds = loadSavedCredentials();
  if (!creds) {
    return null;
  }

  console.log('🔄 Attempting silent login from saved credentials...');
  try {
    const baseSdk = await CardinalBaseSdk.initialize(
      config.projectId,
      config.apiUrl,
      new AuthenticationMethod.UsingCredentials.UsernamePassword(
        creds.email,
        creds.token,
      ),
      baseSdkOptions(),
    );
    const sdk = await baseSdk.toFullSdk(
      StorageFacade.usingBrowserLocalStorage(),
      toFullSdkOptions(),
    );
    activeSdk = sdk;
    console.log('✅ Session restored');
    return sdk;
  } catch (e) {
    console.warn('Could not restore session — credentials may be expired:', e);
    clearSavedCredentials();
    return null;
  }
}

export async function logout(): Promise<void> {
  activeSdk = null;
  pendingAuthStep = null;
  pendingEmail = null;
  verifyInFlight = null;
  clearSavedCredentials();
  console.log('👋 Logged out');
}

export function getActiveSdk(): CardinalSdk {
  if (!activeSdk) throw new Error('Not logged in.');
  return activeSdk;
}

export function isLoggedIn(): boolean {
  return activeSdk !== null;
}

export { config as cardinalConfig };

// -------------------------------------------------------------------------
// Kerberus captcha
// -------------------------------------------------------------------------
async function resolveKerberusCaptcha(): Promise<Solution> {
  const { resolveChallenge } = await import('@icure/cardinal-sdk/kerberus');

  const challengeResp = await fetch(
    `${config.msgGwUrl}/${config.externalServicesId}/challenge`,
  );
  if (!challengeResp.ok) {
    throw new Error(`Could not fetch captcha challenge: ${challengeResp.status}`);
  }
  const challenge = await challengeResp.json();

  console.log('🧩 Solving captcha...');
  const solution = await resolveChallenge(
    challenge,
    config.externalServicesId,
    undefined,
    (progress: number) => {
      if (progress === 1) console.log('🧩 Captcha solved');
    },
  );
  return solution;
}