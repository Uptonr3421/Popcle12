import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';

const REVIEW_KEY = '@popcle_review_prompted';

/**
 * Prompt for an App Store / Play Store review when the customer hits
 * their first milestone (5 stamps). Only fires once per install.
 *
 * Requires: npx expo install expo-store-review
 */
export async function checkAndPromptReview(stampCount: number): Promise<void> {
  if (stampCount < 5) return;

  try {
    const alreadyPrompted = await AsyncStorage.getItem(REVIEW_KEY);
    if (alreadyPrompted) return;

    const isAvailable = await StoreReview.isAvailableAsync();
    if (!isAvailable) return;

    await StoreReview.requestReview();
    await AsyncStorage.setItem(REVIEW_KEY, 'true');
  } catch {
    // Silently fail — review prompt is non-critical
  }
}
