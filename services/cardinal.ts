// services/cardinal.ts
// This file handles the connection to Cardinal SDK

import { CardinalSdk } from '@icure/cardinal-sdk';

// Read configuration from environment variables (.env.local)
const config = {
  apiUrl: import.meta.env.VITE_CARDINAL_API_URL,
  msgGwUrl: import.meta.env.VITE_CARDINAL_MSG_GW_URL,
  externalServicesId: import.meta.env.VITE_CARDINAL_EXTERNAL_SERVICES_ID,
  emailAuthProcessId: import.meta.env.VITE_CARDINAL_EMAIL_AUTH_PROCESS_ID,
  parentOrgId: import.meta.env.VITE_CARDINAL_PARENT_ORG_ID,
  projectId: import.meta.env.VITE_CARDINAL_PROJECT_ID,
};

// Quick sanity check: log to browser console if any value is missing
export function checkCardinalConfig() {
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

export { config as cardinalConfig };