import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Register for push notifications and save the Expo push token to DB.
 * Call this once after login.
 */
export async function registerPushToken(userId: string): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Push notifications only work on physical devices');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission denied');
    return null;
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: 'YOUR_EAS_PROJECT_ID', // Replace with EAS project ID after eas init
    });
    const token = tokenData.data;

    await supabase.from('users').update({ expo_push_token: token }).eq('id', userId);
    // Also save to AsyncStorage so background geofence task can access it
    await AsyncStorage.setItem('@popcle_push_token', token);
    return token;
  } catch (err) {
    console.error('Failed to get push token:', err);
    return null;
  }
}

/**
 * Send a push notification to a single token via Supabase Edge Function.
 */
export async function sendPushNotification(
  token: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
) {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

  await fetch(`${supabaseUrl}/functions/v1/send-push`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({ token, title, body, data }),
  });
}

/**
 * Broadcast push to all customers who have a push token.
 * Admin only — call from admin screen.
 */
export async function broadcastToAllCustomers(title: string, body: string) {
  const { data: customers } = await supabase
    .from('users')
    .select('expo_push_token')
    .eq('user_type', 'customer')
    .not('expo_push_token', 'is', null);

  if (!customers || customers.length === 0) return { sent: 0 };

  await Promise.allSettled(
    customers
      .filter((c) => c.expo_push_token)
      .map((c) => sendPushNotification(c.expo_push_token!, title, body))
  );

  return { sent: customers.length };
}
