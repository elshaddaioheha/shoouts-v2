export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAdmin?: boolean;
};

export type StartupStatus = 'ready' | 'degraded_config' | 'degraded_auth';
