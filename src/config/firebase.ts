import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import * as FirebaseAuth from 'firebase/auth';
import {
  getAuth,
  initializeAuth,
  type Auth,
  type Persistence,
} from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  type Firestore,
} from 'firebase/firestore';
import { Platform } from 'react-native';
import { assertEnv, env } from './env';

type ReactNativePersistenceFactory = (
  storage: typeof AsyncStorage
) => Persistence;

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firebaseDb: Firestore | null = null;

const firebaseConfig = {
  apiKey: env.firebaseApiKey,
  authDomain: env.firebaseAuthDomain,
  projectId: env.firebaseProjectId,
  storageBucket: env.firebaseStorageBucket,
  messagingSenderId: env.firebaseMessagingSenderId,
  appId: env.firebaseAppId,
};

export function getFirebaseApp() {
  assertEnv();

  if (!firebaseApp) {
    firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }

  return firebaseApp;
}

export function getFirebaseAuth() {
  if (firebaseAuth) {
    return firebaseAuth;
  }

  const app = getFirebaseApp();

  if (Platform.OS === 'web') {
    firebaseAuth = getAuth(app);
    return firebaseAuth;
  }

  const getReactNativePersistence = (
    FirebaseAuth as unknown as {
      getReactNativePersistence?: ReactNativePersistenceFactory;
    }
  ).getReactNativePersistence;

  try {
    firebaseAuth =
      typeof getReactNativePersistence === 'function'
        ? initializeAuth(app, {
            persistence: getReactNativePersistence(AsyncStorage),
          })
        : getAuth(app);
  } catch (error) {
    if (__DEV__) {
      console.warn('[firebase] Falling back to default auth initialization.', error);
    }

    firebaseAuth = getAuth(app);
  }

  return firebaseAuth;
}

export function getFirebaseDb() {
  if (firebaseDb) {
    return firebaseDb;
  }

  const app = getFirebaseApp();

  if (Platform.OS === 'web') {
    firebaseDb = getFirestore(app);
    return firebaseDb;
  }

  try {
    firebaseDb = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
  } catch {
    firebaseDb = getFirestore(app);
  }

  return firebaseDb;
}
