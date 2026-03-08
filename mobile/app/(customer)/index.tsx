import { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { registerPushToken } from '@/lib/push';
import { cacheStamps, getCachedStamps } from '@/lib/cache';
import {
  startGeofenceMonitoring,
  stopGeofenceMonitoring,
  distanceMeters,
  STORE_LOCATION,
} from '@/lib/geofence';
import { checkAndPromptReview } from '@/lib/review';
import StampCardSkeleton from '@/components/StampCardSkeleton';

export default function CustomerHome() {
  const { phone } = useAuth();
  const [stampCount, setStampCount] = useState<number>(0);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [nearStore, setNearStore] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const locationWatchRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    if (!phone) return;

    fetchUser();
    initLocationAndPush();

    // ── Supabase Realtime: live stamp updates ──────────────────────────────
    const channel = supabase
      .channel(`stamps-${phone}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `phone=eq.${phone}`,
        },
        (payload: any) => {
          const newCount: number = payload?.new?.stamp_count ?? 0;
          setStampCount((prev) => {
            if (newCount > prev) {
              import('@/lib/feedback').then(({ playCelebration }) =>
                playCelebration()
              );
            }
            return newCount;
          });
          checkAndPromptReview(newCount);
        }
      )
      .subscribe();

    return () => {
      locationWatchRef.current?.remove();
      supabase.removeChannel(channel);
    };
  }, [phone]);

  const initLocationAndPush = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) registerPushToken(session.user.id);

    await startGeofenceMonitoring();

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const watchSub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 30000,
          distanceInterval: 50,
        },
        (pos) => {
          const dist = distanceMeters(
            pos.coords.latitude,
            pos.coords.longitude,
            STORE_LOCATION.lat,
            STORE_LOCATION.lng
          );
          setNearStore(dist < 500);
        }
      );
      locationWatchRef.current = watchSub;
    } catch (err) {
      console.error('Location watch error:', err);
    }
  };

  const fetchUser = async () => {
    if (!phone) return;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('name, stamp_count')
        .eq('phone', phone)
        .single();
      if (error) throw error;
      if (data) {
        setName(data.name || 'Customer');
        setStampCount(data.stamp_count || 0);
        setIsOffline(false);

        // Cache stamps for offline use
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          cacheStamps(session.user.id, data.stamp_count || 0);
          // Save for background geofence task
          const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
          await AsyncStorage.setItem('@popcle_user_id', session.user.id);
        }
      }
    } catch (err) {
      console.warn('Supabase fetch failed, trying cache:', err);
      // Fall back to cached stamps
      const { data: { session } } = await supabase.auth.getSession().catch(() => ({ data: { session: null } }));
      if (session?.user?.id) {
        const cached = await getCachedStamps(session.user.id);
        if (cached !== null) {
          setStampCount(cached);
          setIsOffline(true);
        }
      }
    }
    setLoading(false);
  };

  const handleRedeem = async () => {
    if (stampCount < 10) return;
    Alert.alert(
      'Redeem Reward',
      'Show this to staff to claim your free item!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            if (!phone) return;
            setRedeeming(true);
            try {
              // Get user ID for RPC call
              const { data: userData } = await supabase
                .from('users')
                .select('id')
                .eq('phone', phone)
                .single();

              if (!userData?.id) throw new Error('User not found');

              // Atomic redemption via Supabase RPC — prevents double redeem
              const { data, error } = await supabase.rpc('redeem_reward', {
                p_user_id: userData.id,
              });

              if (error) throw error;

              if (data?.success) {
                setStampCount(0);
                Alert.alert('Redeemed!', 'Enjoy your free item! Stamps reset to 0.');
              } else {
                Alert.alert('Cannot Redeem', data?.error || 'Please try again');
              }
            } catch (err) {
              Alert.alert(
                'Redemption Failed',
                "You're offline or something went wrong. Please redeem in store."
              );
              // Don't reset local stamp count on failure
            } finally {
              setRedeeming(false);
            }
          },
        },
      ]
    );
  };

  const handleSignOut = async () => {
    locationWatchRef.current?.remove();
    await stopGeofenceMonitoring();
    await supabase.auth.signOut();
  };

  if (loading) {
    return <StampCardSkeleton />;
  }

  const isReady = stampCount >= 10;
  const remaining = 10 - stampCount;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerLogo}>Pop Culture CLE</Text>
        <View style={styles.headerBadge} accessibilityLabel={`You have ${stampCount} out of 10 stamps`} accessibilityRole="text">
          <Text style={styles.headerBadgeText}>{stampCount}/10 stamps</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* ── Near-Store Banner ────────────────────────────────────────── */}
        {nearStore && (
          <View style={styles.nearBanner}>
            <Text style={styles.nearBannerText}>
              📍 You're near Pop Culture CLE! Check out today's offers!
            </Text>
          </View>
        )}

        {/* ── Offline Banner ───────────────────────────────────────────── */}
        {isOffline && (
          <View style={styles.offlineBanner} accessibilityRole="alert" accessibilityLabel="You are currently offline. Showing cached data.">
            <Text style={styles.offlineBannerText}>Offline</Text>
          </View>
        )}

        {/* ── Welcome ──────────────────────────────────────────────────── */}
        <Text style={styles.welcome}>Hi, {name}! 🍦</Text>
        <Text style={styles.welcomeSub}>Here's your loyalty card</Text>

        {/* ── Stamp Card ───────────────────────────────────────────────── */}
        <View style={styles.stampCard}>
          <Text style={styles.stampLabel}>YOUR STAMPS</Text>
          <Text style={styles.stampNumber}>{stampCount}</Text>
          <Text style={styles.stampDenom}>of 10</Text>

          {/* Circle stamp grid — 2 rows × 5 cols */}
          <View style={styles.stampGrid}>
            {Array.from({ length: 10 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.stampCircle,
                  i < stampCount ? styles.stampFilled : styles.stampEmpty,
                ]}
                accessibilityLabel={`Stamp ${i + 1}: ${i < stampCount ? 'earned' : 'empty'}`}
              >
                {i < stampCount ? (
                  <Text style={styles.stampCheckmark}>✓</Text>
                ) : (
                  <Text style={styles.stampNum}>{i + 1}</Text>
                )}
              </View>
            ))}
          </View>

          {/* Progress text */}
          {!isReady && (
            <Text style={styles.progressText}>
              {remaining} more stamp{remaining !== 1 ? 's' : ''} to go!
            </Text>
          )}

          {/* Reward ready banner */}
          {isReady && (
            <LinearGradient
              colors={['#ff3b8d', '#ff7b32']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.rewardBanner}
            >
              <Text style={styles.rewardBannerText}>🎉 REWARD READY!</Text>
            </LinearGradient>
          )}

          {/* Claim button */}
          <TouchableOpacity
            onPress={handleRedeem}
            disabled={!isReady || redeeming}
            style={!isReady || redeeming ? styles.btnDisabled : undefined}
            activeOpacity={0.85}
            accessibilityLabel="Claim your free item reward"
            accessibilityRole="button"
            accessibilityState={{ disabled: !isReady || redeeming }}
          >
            <LinearGradient
              colors={['#ff3b8d', '#ff7b32']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.claimButton}
            >
              <Text style={styles.claimText}>
                {redeeming ? 'Claiming...' : '🎁 Claim Free Item'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ── QR Code Card ─────────────────────────────────────────────── */}
        <View style={styles.qrCard}>
          <Text style={styles.qrTitle}>Your QR Code</Text>
          <Text style={styles.qrSub}>Show to staff to earn stamps</Text>
          {phone ? (
            <>
              <View style={styles.qrFrame} accessibilityLabel="Your loyalty QR code. Show this to staff when making a purchase." accessibilityRole="image">
                <QRCode
                  value={phone}
                  size={220}
                  backgroundColor="white"
                  color="#1f1715"
                />
              </View>
              <Text style={styles.qrCaption}>SHOW TO STAFF</Text>
            </>
          ) : (
            <View style={styles.qrFrame}>
              <Text style={{ color: 'rgba(31,23,21,0.5)', fontSize: 15, fontWeight: '600', textAlign: 'center', paddingVertical: 40 }}>
                Sign in to see your QR code
              </Text>
            </View>
          )}
        </View>

        {/* ── Sign Out ─────────────────────────────────────────────────── */}
        <TouchableOpacity onPress={handleSignOut} activeOpacity={0.7}>
          <Text style={styles.signOut}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff9f5' },
  content: { paddingHorizontal: 20, paddingBottom: 48 },
  loading: {
    flex: 1,
    backgroundColor: '#fff9f5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(31,23,21,0.1)',
  },
  headerLogo: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ff3b8d',
    letterSpacing: -0.5,
  },
  headerBadge: {
    backgroundColor: '#ff3b8d',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  headerBadgeText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // ── Near-store banner
  nearBanner: {
    backgroundColor: '#ff3b8d',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    marginBottom: 4,
    shadowColor: '#ff3b8d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  nearBannerText: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 14,
  },

  // ── Welcome
  welcome: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1f1715',
    marginTop: 24,
    marginBottom: 4,
    textAlign: 'center',
  },
  welcomeSub: {
    fontSize: 14,
    color: 'rgba(31,23,21,0.5)',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },

  // ── Stamp card
  stampCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#1f1715',
    shadowColor: '#1f1715',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  stampLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(31,23,21,0.45)',
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 8,
  },
  stampNumber: {
    fontSize: 72,
    fontWeight: '800',
    color: '#ff3b8d',
    textAlign: 'center',
    lineHeight: 80,
  },
  stampDenom: {
    fontSize: 16,
    color: 'rgba(31,23,21,0.45)',
    textAlign: 'center',
    fontWeight: '600',
    marginTop: -4,
    marginBottom: 24,
  },

  stampGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  stampCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampFilled: { backgroundColor: '#ff3b8d' },
  stampEmpty: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: 'rgba(31,23,21,0.2)',
  },
  stampCheckmark: { fontSize: 20, color: '#fff', fontWeight: '800' },
  stampNum: { fontSize: 14, color: 'rgba(31,23,21,0.35)', fontWeight: '700' },

  progressText: {
    textAlign: 'center',
    color: 'rgba(31,23,21,0.5)',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 16,
  },

  rewardBanner: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    alignItems: 'center',
  },
  rewardBannerText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 17,
    letterSpacing: 0.5,
  },

  claimButton: {
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#ff3b8d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  claimText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.3,
  },

  // ── QR card
  qrCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1f1715',
    shadowColor: '#1f1715',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1f1715',
    marginBottom: 4,
  },
  qrSub: {
    fontSize: 13,
    color: 'rgba(31,23,21,0.5)',
    marginBottom: 20,
    fontWeight: '500',
  },
  qrFrame: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(31,23,21,0.1)',
  },
  qrCaption: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ff3b8d',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginTop: 16,
  },

  // ── Sign out
  signOut: {
    textAlign: 'center',
    color: 'rgba(31,23,21,0.4)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 8,
  },

  btnDisabled: { opacity: 0.5 },

  // ── Offline banner
  offlineBanner: {
    backgroundColor: '#ff7b32',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    alignItems: 'center',
  },
  offlineBannerText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
});
