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
    'EXPO_PUBLIC_FIREBASE_API_KEY',
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY
  ),
  firebaseAuthDomain: getEnv(
    'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
  ),
  firebaseProjectId: getEnv(
    'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID
  ),
  firebaseStorageBucket: getEnv(
    'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
  ),
  firebaseMessagingSenderId: getEnv(
    'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  ),
  firebaseAppId: getEnv(
    'EXPO_PUBLIC_FIREBASE_APP_ID',
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID
  ),
};

export function assertEnv() {
  const missing = Object.entries(env)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length) {
    throw new Error(`Missing env vars: ${missing.join(', ')}`);
  }
}
