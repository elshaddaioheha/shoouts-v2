const requiredEnvVars = {
  firebaseApiKey: 'EXPO_PUBLIC_FIREBASE_API_KEY',
  firebaseAuthDomain: 'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  firebaseProjectId: 'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  firebaseStorageBucket: 'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  firebaseMessagingSenderId: 'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  firebaseAppId: 'EXPO_PUBLIC_FIREBASE_APP_ID',
} as const;

function getEnv(name: string, value: string | undefined, fallback = '') {
  if (!value) {
    if (__DEV__) {
      console.warn(`[env] Missing: ${name}`);
    }

    return fallback;
  }

  return value;
}

export const env = {
  firebaseApiKey: getEnv(
    requiredEnvVars.firebaseApiKey,
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY
  ),
  firebaseAuthDomain: getEnv(
    requiredEnvVars.firebaseAuthDomain,
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
  ),
  firebaseProjectId: getEnv(
    requiredEnvVars.firebaseProjectId,
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID
  ),
  firebaseStorageBucket: getEnv(
    requiredEnvVars.firebaseStorageBucket,
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
  ),
  firebaseMessagingSenderId: getEnv(
    requiredEnvVars.firebaseMessagingSenderId,
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  ),
  firebaseAppId: getEnv(
    requiredEnvVars.firebaseAppId,
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID
  ),
};

export function getMissingEnvVars() {
  return Object.entries(env)
    .filter(([, value]) => !value)
    .map(([key]) => requiredEnvVars[key as keyof typeof requiredEnvVars]);
}

export function hasRequiredEnv() {
  return getMissingEnvVars().length === 0;
}

export function assertEnv() {
  const missing = getMissingEnvVars();

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
