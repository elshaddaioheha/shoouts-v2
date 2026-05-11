import { FirebaseError } from 'firebase/app';
import type { StartupStatus } from '@/src/features/auth/auth.types';

type StartupCopy = {
  title: string;
  message: string;
};

type ReadErrorCopyOptions = {
  subject: string;
  startupStatus?: StartupStatus;
};

export function getStartupStatusCopy(
  startupStatus: StartupStatus,
  startupMessage?: string | null
): StartupCopy | null {
  if (startupStatus === 'ready') {
    return null;
  }

  if (startupStatus === 'degraded_config') {
    return {
      title: 'Shoouts is running in limited mode',
      message:
        startupMessage ??
        'Firebase configuration is unavailable, so sign-in and synced content are temporarily disabled while the app still opens safely.',
    };
  }

  return {
    title: 'Shoouts is running with auth limited',
    message:
      startupMessage ??
      'Firebase auth did not initialize cleanly, so account-linked features may stay unavailable until startup stabilizes.',
  };
}

export function getReadErrorCopy(
  error: unknown,
  { subject, startupStatus = 'ready' }: ReadErrorCopyOptions
): StartupCopy {
  if (startupStatus === 'degraded_config') {
    return {
      title: `${subject} unavailable in limited mode`,
      message:
        'Shoouts opened without a working Firebase configuration, so this content cannot sync right now. Core navigation still works.',
    };
  }

  if (isConfigError(error)) {
    return {
      title: `${subject} unavailable`,
      message:
        'Firebase configuration is invalid or incomplete, so this content cannot load until app configuration is fixed.',
    };
  }

  if (startupStatus === 'degraded_auth') {
    return {
      title: `Couldn't load ${subject.toLowerCase()}`,
      message:
        'Shoouts opened in auth-limited mode. Public content may still work, but account-linked reads can fail until startup stabilizes.',
    };
  }

  if (error instanceof FirebaseError) {
    if (error.code === 'permission-denied') {
      return {
        title: `Couldn't load ${subject.toLowerCase()}`,
        message:
          'This data is currently blocked by Firestore rules or project permissions.',
      };
    }

    if (error.code === 'failed-precondition') {
      return {
        title: `Couldn't load ${subject.toLowerCase()}`,
        message:
          'This query needs backend index or configuration support before it can load completely.',
      };
    }

    if (error.code === 'unavailable') {
      return {
        title: `${subject} temporarily unavailable`,
        message:
          'The backend is temporarily unavailable. Try again in a moment.',
      };
    }
  }

  return {
    title: `Couldn't load ${subject.toLowerCase()}`,
    message: 'Please try again after checking backend access and configuration.',
  };
}

export function classifyAuthStartupFailure(error: unknown): StartupStatus {
  if (isConfigError(error)) {
    return 'degraded_config';
  }

  return 'degraded_auth';
}

function isConfigError(error: unknown) {
  const code =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code?: unknown }).code === 'string'
      ? (error as { code: string }).code
      : '';
  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : typeof error === 'string'
        ? error.toLowerCase()
        : '';

  return (
    code === 'auth/invalid-api-key' ||
    code === 'app/invalid-api-key' ||
    message.includes('invalid api key') ||
    message.includes('invalid-api-key') ||
    message.includes('missing required environment variables')
  );
}
