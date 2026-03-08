/**
 * Audio + haptic feedback for scan events.
 * Sound files are WAV tones in assets/sounds/.
 */
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

const loadAndPlay = async (file: any) => {
  try {
    const { sound } = await Audio.Sound.createAsync(file);
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status) => {
      if ('didJustFinish' in status && status.didJustFinish) sound.unloadAsync();
    });
  } catch {
    // Audio not available — fail silently
  }
};

/** Stamp successfully added — positive beep + haptic */
export async function playSuccess(): Promise<void> {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await loadAndPlay(require('../assets/sounds/beep-success.wav'));
  } catch {}
}

/** Scan failed — low tone + error haptic */
export async function playError(): Promise<void> {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    await loadAndPlay(require('../assets/sounds/beep-error.wav'));
  } catch {}
}

/** 10 stamps reached — celebration jingle + double haptic */
export async function playCelebration(): Promise<void> {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await new Promise(resolve => setTimeout(resolve, 100));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await loadAndPlay(require('../assets/sounds/celebration.wav'));
  } catch {}
}

/** Light tap feedback for UI interactions */
export async function playTap(): Promise<void> {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {}
}
