import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { supabase } from './supabase';
import { sendPushNotification } from './push';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const GEOFENCE_TASK_NAME = 'POPCLE_GEOFENCE_TASK';

interface GeofenceOffer {
  id: string;
  title: string;
  description?: string;
  lat: number;
  lng: number;
  radius_meters: number;
}

// This task runs in the background even when the app is closed.
// Must be defined at module level (not inside a component).
TaskManager.defineTask(GEOFENCE_TASK_NAME, async ({ data, error }: any) => {
  if (error) {
    console.error('Geofence task error:', error.message);
    return;
  }
  if (!data) return;

  const { eventType, region } = data;

  if (eventType !== Location.GeofencingEventType.Enter) return;

  try {
    // Read push token from AsyncStorage (saved during login)
    const token = await AsyncStorage.getItem('@popcle_push_token');
    if (!token) return;

    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return;

    // Fetch offer details via Supabase REST API (no JS client in background task)
    const offersRes = await fetch(
      `${supabaseUrl}/rest/v1/offers?id=eq.${region.identifier}&select=id,title,description,discount_label,discount_percentage,free_item&active=eq.true`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!offersRes.ok) return;
    const offers = await offersRes.json();
    const offer = offers[0];
    if (!offer) return;

    const discountLabel = offer.discount_label
      || (offer.free_item ? 'FREE ITEM'
        : offer.discount_percentage ? `${offer.discount_percentage}% OFF`
        : 'Special Deal');

    // Send push via Supabase Edge Function
    await fetch(`${supabaseUrl}/functions/v1/send-push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        token,
        title: `🍦 ${discountLabel} — Pop Culture CLE`,
        body: offer.description || `${offer.title} is available near you!`,
        data: { screen: 'offers', offerId: offer.id },
      }),
    });

    // Log the geofence event to Supabase for analytics
    const userId = await AsyncStorage.getItem('@popcle_user_id');
    if (userId) {
      await fetch(`${supabaseUrl}/rest/v1/geofence_events`, {
        method: 'POST',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          user_id: userId,
          special_id: offer.id,
          triggered_at: new Date().toISOString(),
          push_sent: true,
        }),
      });
    }
  } catch (err) {
    console.error('Geofence push delivery error:', err);
  }
});

/**
 * Start monitoring geofences for all active offers with location data.
 * Call after login on the customer screen.
 *
 * SQL migration required before using this feature:
 * ALTER TABLE offers
 * ADD COLUMN IF NOT EXISTS lat float8,
 * ADD COLUMN IF NOT EXISTS lng float8,
 * ADD COLUMN IF NOT EXISTS radius_meters integer DEFAULT 200;
 */
export async function startGeofenceMonitoring() {
  try {
    const { status: foreground } = await Location.requestForegroundPermissionsAsync();
    if (foreground !== 'granted') return;

    const { status: background } = await Location.requestBackgroundPermissionsAsync();
    if (background !== 'granted') return;

    // Fetch active offers with geofence coordinates
    const { data: offers } = await supabase
      .from('offers')
      .select('id, title, lat, lng, radius_meters')
      .eq('active', true)
      .eq('geofence_enabled', true)
      .not('lat', 'is', null)
      .not('lng', 'is', null);

    if (!offers || offers.length === 0) return;

    const regions: Location.LocationRegion[] = offers.map((offer: GeofenceOffer) => ({
      identifier: offer.id,
      latitude: offer.lat,
      longitude: offer.lng,
      radius: offer.radius_meters || 200,
      notifyOnEnter: true,
      notifyOnExit: false,
    }));

    await Location.startGeofencingAsync(GEOFENCE_TASK_NAME, regions);
    console.log('Geofencing started for:', regions.map(r => r.identifier).join(', '));
  } catch (err) {
    console.error('Failed to start geofencing:', err);
  }
}

/**
 * Stop all geofence monitoring. Call on sign out.
 */
export async function stopGeofenceMonitoring() {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(GEOFENCE_TASK_NAME);
    if (isRegistered) {
      await Location.stopGeofencingAsync(GEOFENCE_TASK_NAME);
    }
  } catch (err) {
    console.error('Failed to stop geofencing:', err);
  }
}

/**
 * Check distance from store and return whether user is within radius (meters).
 * Used for in-app geofence indication on the customer dashboard.
 */
export function distanceMeters(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Store coordinates for Pop Culture CLE, Solon OH
export const STORE_LOCATION = {
  lat: 41.4384,
  lng: -81.4096,
  name: 'Pop Culture CLE',
  address: '33549 Solon Rd, Solon, OH 44139',
};
