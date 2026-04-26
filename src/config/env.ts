const APP_ENV = process.env.EXPO_PUBLIC_APP_ENV ?? 'development';

export const env = {
  appEnv: APP_ENV,
  isDev: APP_ENV === 'development',
  isProd: APP_ENV === 'production',
} as const;
