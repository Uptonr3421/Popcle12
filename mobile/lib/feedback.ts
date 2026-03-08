/**
 * Audio + haptic feedback for scan events.
 *
 * Audio files: add to mobile/assets/sounds/
 *   - beep-success.mp3  (short positive tone, ~0.3s)
 *   - beep-error.mp3    (short negative tone, ~0.3s)
 *   - celebration.mp3   (happy jingle, ~1s)
 *
 * Free sounds: https://freesound.org (search "beep success")
 * Or generate tones at: https://www.audiocheck.net/audiofrequencysignalgenerator_sinetone.php
 */
import * as Haptics from 'expo-haptics';

// Audio imports are commented until sound files are added to assets/sounds/
// import { Audio } from 'expo-av';
// const loadSound = async (file: any) => {
//   const { sound } = await Audio.Sound.createAsync(file);
//   return sound;
// };

/**
 * Stamp successfully added — positive confirmation
 * Call on staff side after successful stamp insert
 */
export async function playSuccess(): Promise<void> {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Uncomment once beep-success.mp3 is added to assets/sounds/:
    // const sound = await loadSound(require('../assets/sounds/beep-success.mp3'));
    // await sound.playAsync();
    // sound.setOnPlaybackStatusUpdate((status) => {
    //   if ('didJustFinish' in status && status.didJustFinish) sound.unloadAsync();
    // });
  } catch {
    // Haptics not available on all devices — fail silently
  }
}

/**
 * Scan failed — negative feedback
 * Call on staff side for errors (customer not found, unauthorized, etc.)
 */
export async function playError(): Promise<void> {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    // Uncomment once beep-error.mp3 added:
    // const sound = await loadSound(require('../assets/sounds/beep-error.mp3'));
    // await sound.playAsync();
  } catch {
    // fail silently
  }
}

/**
 * Reward reached 10 stamps — celebration
 * Call on customer side via realtime subscription when stampCount reaches 10
 */
export async function playCelebration(): Promise<void> {
  try {
    // Double impact for celebration feel
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await new Promise(resolve => setTimeout(resolve, 100));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Uncomment once celebration.mp3 added:
    // const sound = await loadSound(require('../assets/sounds/celebration.mp3'));
    // await sound.playAsync();
  } catch {
    // fail silently
  }
}

/**
 * Light tap feedback for UI interactions
 */
export async function playTap(): Promise<void> {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {}
}
