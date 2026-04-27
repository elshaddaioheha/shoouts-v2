function getRequiredEnv(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  firebaseApiKey: getRequiredEnv(
    'EXPO_PUBLIC_FIREBASE_API_KEY',
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY
  ),
  firebaseAuthDomain: getRequiredEnv(
    'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
  ),
  firebaseProjectId: getRequiredEnv(
    'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID
  ),
  firebaseStorageBucket: getRequiredEnv(
    'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
  ),
  firebaseMessagingSenderId: getRequiredEnv(
    'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  ),
  firebaseAppId: getRequiredEnv(
    'EXPO_PUBLIC_FIREBASE_APP_ID',
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID
  ),
};
