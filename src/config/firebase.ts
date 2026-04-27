import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import { env } from './env';

const firebaseConfig = {
  apiKey: env.firebaseApiKey,
  authDomain: env.firebaseAuthDomain,
  projectId: env.firebaseProjectId,
  storageBucket: env.firebaseStorageBucket,
  messagingSenderId: env.firebaseMessagingSenderId,
  appId: env.firebaseAppId,
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth =
  Platform.OS === 'web'
    ? getAuth(firebaseApp)
    : initializeAuth(firebaseApp, {
        persistence: getReactNativePersistence(AsyncStorage),
      });

export const db = getFirestore(firebaseApp);