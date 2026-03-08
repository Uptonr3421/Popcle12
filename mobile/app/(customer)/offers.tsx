import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
} from 'react-native';
import { getActiveDeals, formatCountdown, ActiveDeal } from '@/lib/deals';
import { cacheOffers, getCachedOffers } from '@/lib/cache';
import OffersSkeleton from '@/components/OffersSkeleton';

export default function OffersScreen() {
  const [deals, setDeals] = useState<ActiveDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    fetchOffers();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const active = await getActiveDeals();
      setDeals(active);
      setIsOffline(false);
      cacheOffers(active);
    } catch (err) {
      console.warn('Failed to fetch offers, trying cache:', err);
      const cached = await getCachedOffers();
      setDeals(cached as ActiveDeal[]);
      setIsOffline(true);
    }
    setLoading(false);
  };

  // Recompute seconds left on each tick, filter out expired deals
  const dealsWithCountdown = deals
    .map(d => ({
      ...d,
      secondsLeft: Math.max(0, Math.floor((new Date(d.expiresAt).getTime() - Date.now()) / 1000)),
    }))
    .filter(d => d.secondsLeft > 0);

  if (loading) {
    return <OffersSkeleton />;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.title}>Special Offers</Text>
        <Text style={styles.subtitle}>Exclusive deals for loyal customers</Text>

        {isOffline && (
          <Text style={styles.offlineText} accessibilityRole="alert">Offline — showing last known deals</Text>
        )}

        {dealsWithCountdown.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🍦</Text>
            <Text style={styles.emptyText}>No active deals right now</Text>
            <Text style={styles.emptySubtext}>Check back soon for special offers!</Text>
          </View>
        ) : (
          dealsWithCountdown.map((d) => (
            <View key={d.id} style={styles.offerCard} accessibilityLabel={`${d.title}: ${d.description}. ${d.secondsLeft > 0 ? 'Expires in ' + formatCountdown(d.secondsLeft) : 'Expired'}`}>
              <Text style={styles.offerDiscount}>{d.discountLabel}</Text>
              <Text style={styles.offerTitle}>{d.title}</Text>
              <Text style={styles.offerDesc}>{d.description}</Text>
              <View style={styles.countdownRow}>
                <Text style={styles.countdownLabel}>ENDS IN</Text>
                <Text style={[styles.countdown, d.secondsLeft < 3600 ? styles.countdownUrgent : null]}>
                  {formatCountdown(d.secondsLeft)}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff9f5' },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 48,
  },
  loading: {
    flex: 1,
    backgroundColor: '#fff9f5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#ff3b8d',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(31,23,21,0.5)',
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '500',
  },

  // ── Empty state
  empty: { alignItems: 'center', padding: 48 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f1715',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(31,23,21,0.5)',
    textAlign: 'center',
  },

  // ── Offer card — comic book style
  offerCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 16,
    padding: 20,
    borderWidth: 3,
    borderColor: '#1f1715',
    shadowColor: '#1f1715',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  offerDiscount: {
    fontSize: 30,
    fontWeight: '800',
    color: '#ff3b8d',
    marginBottom: 6,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1f1715',
    marginBottom: 10,
  },
  offerDesc: {
    fontSize: 14,
    color: 'rgba(31,23,21,0.65)',
    lineHeight: 20,
    marginBottom: 12,
    fontWeight: '500',
  },

  // ── Countdown timer
  countdownRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  countdownLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(31,23,21,0.4)', letterSpacing: 2, textTransform: 'uppercase' },
  countdown: { fontSize: 16, fontWeight: '800', color: '#ff3b8d', fontVariant: ['tabular-nums'] },
  countdownUrgent: { color: '#ff3b8d' },

  // ── Offline indicator
  offlineText: {
    textAlign: 'center',
    color: '#ff7b32',
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 16,
  },
});
