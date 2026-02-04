import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSession } from '../services/auth';

export type AppState = 'ONBOARDING' | 'WELCOME' | 'AUTH_LOGIN' | 'AUTH_SIGNUP' | 'MAIN' | 'LEGAL';

export const useAppFlow = () => {
  const { data: session, isPending } = useSession();
  const [appState, setAppState] = useState<AppState>('WELCOME');
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const seen = await AsyncStorage.getItem('hasSeenOnboarding');
        if (seen !== 'true' && !session) {
          setAppState('ONBOARDING');
        }
        setHasCheckedOnboarding(true);
      } catch (e) {
        setHasCheckedOnboarding(true);
      }
    };
    checkOnboarding();
  }, [session]);

  useEffect(() => {
    if (!isPending && hasCheckedOnboarding) {
      if (session) {
        setAppState('MAIN');
      } else if (appState === 'MAIN') {
        setAppState('WELCOME');
      }
    }
  }, [session, isPending, hasCheckedOnboarding, appState]);

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    setAppState('WELCOME');
  };

  const handleAuthenticated = () => {
    setAppState('MAIN');
  };

  return {
    appState,
    setAppState,
    hasCheckedOnboarding,
    completeOnboarding,
    handleAuthenticated,
    session,
    isPending,
  };
};
