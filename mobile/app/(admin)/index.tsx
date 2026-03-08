import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';

interface Stats {
  totalCustomers: number;
  totalStamps: number;
  rewardsRedeemed: number;
  activeOffers: number;
  stampsToday: number;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    const [usersRes, recordsRes, offersRes] = await Promise.all([
      supabase.from('users').select('stamp_count').eq('user_type', 'customer'),
      supabase.from('loyalty_records').select('action, stamp_added_at'),
      supabase.from('offers').select('id').eq('active', true),
    ]);

    const users = usersRes.data || [];
    const records = recordsRes.data || [];
    const offers = offersRes.data || [];

    const today = new Date().toISOString().split('T')[0];
    const stampsToday = records.filter(r =>
      r.action === 'stamp_added' && r.stamp_added_at?.startsWith(today)
    ).length;

    setStats({
      totalCustomers: users.length,
      totalStamps: users.reduce((s, u) => s + (u.stamp_count || 0), 0),
      rewardsRedeemed: records.filter(r => r.action === 'reward_claimed').length,
      activeOffers: offers.length,
      stampsToday,
    });
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => { setRefreshing(true); fetchStats(); };
  const handleSignOut = () => supabase.auth.signOut();

  if (loading) {
    return <View style={styles.loading}><ActivityIndicator size="large" color="#46bbff" /></View>;
  }

  const metrics = [
    { label: 'Customers', value: stats?.totalCustomers ?? 0, color: '#46bbff', sub: 'registered' },
    { label: 'Stamps Today', value: stats?.stampsToday ?? 0, color: '#39ff14', sub: 'since midnight' },
    { label: 'Total Stamps', value: stats?.totalStamps ?? 0, color: '#ffcc33', sub: 'all time' },
    { label: 'Redeemed', value: stats?.rewardsRedeemed ?? 0, color: '#ff7b32', sub: 'rewards claimed' },
    { label: 'Active Offers', value: stats?.activeOffers ?? 0, color: '#46bbff', sub: 'live now' },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#46bbff" />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Pop Culture CLE</Text>
          <View style={styles.adminBadge}><Text style={styles.adminBadgeText}>ADMIN</Text></View>
        </View>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Overview</Text>

      <View style={styles.metricsGrid}>
        {metrics.map((m) => (
          <View key={m.label} style={styles.metricCard}>
            <Text style={[styles.metricValue, { color: m.color }]}>{m.value}</Text>
            <Text style={styles.metricLabel}>{m.label}</Text>
            <Text style={styles.metricSub}>{m.sub}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 48 },
  loading: { flex: 1, backgroundColor: '#0a0f1e', alignItems: 'center', justifyContent: 'center' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#e8edf5', marginBottom: 6 },
  adminBadge: { backgroundColor: 'rgba(70,187,255,0.15)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(70,187,255,0.4)', alignSelf: 'flex-start' },
  adminBadgeText: { color: '#46bbff', fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  signOutBtn: { paddingTop: 4 },
  signOutText: { color: 'rgba(232,237,245,0.35)', fontSize: 13, fontWeight: '500' },

  sectionTitle: { fontSize: 12, fontWeight: '700', color: 'rgba(232,237,245,0.35)', letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 16 },

  metricsGrid: { gap: 12 },
  metricCard: {
    backgroundColor: '#0f1628', borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: 'rgba(70,187,255,0.12)',
  },
  metricValue: { fontSize: 48, fontWeight: '800', lineHeight: 52, letterSpacing: -1 },
  metricLabel: { fontSize: 15, fontWeight: '700', color: '#e8edf5', marginTop: 4 },
  metricSub: { fontSize: 12, color: 'rgba(232,237,245,0.35)', marginTop: 2, fontWeight: '500' },
});
