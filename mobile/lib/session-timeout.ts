import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const LAST_ACTIVE_KEY = '@popcle_last_active';

export async function updateLastActive(): Promise<void> {
  await AsyncStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
}

export async function checkSessionTimeout(): Promise<boolean> {
  try {
    const lastActive = await AsyncStorage.getItem(LAST_ACTIVE_KEY);
    if (!lastActive) return false;

    const elapsed = Date.now() - parseInt(lastActive, 10);
    if (elapsed > TIMEOUT_MS) {
      await supabase.auth.signOut();
      await AsyncStorage.removeItem(LAST_ACTIVE_KEY);
      return true; // session expired
    }
    return false;
  } catch {
    return false;
  }
}

// Call this from root layout to auto-check on app resume
export function setupSessionTimeout(onTimeout: () => void): () => void {
  const handleAppState = async (state: AppStateStatus) => {
    if (state === 'active') {
      const expired = await checkSessionTimeout();
      if (expired) {
        onTimeout();
      } else {
        await updateLastActive();
      }
    } else if (state === 'background') {
      await updateLastActive();
    }
  };

  const subscription = AppState.addEventListener('change', handleAppState);
  updateLastActive(); // set initial

  return () => subscription.remove();
}
