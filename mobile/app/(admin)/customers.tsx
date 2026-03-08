import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { supabase } from '@/lib/supabase';

interface Customer {
  id: string;
  name: string;
  phone: string;
  stamp_count: number;
  user_type: string;
  created_at: string;
}

export default function CustomersScreen() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    setCustomers(data || []);
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => { setRefreshing(true); fetchCustomers(); };

  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color="#46bbff" /></View>;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#46bbff" />}
    >
      <Text style={styles.title}>Customers</Text>
      <Text style={styles.count}>{customers.length} registered</Text>
      {customers.map((c) => {
        const stampStyle = c.stamp_count >= 10 ? styles.stampHigh : c.stamp_count >= 5 ? styles.stampMid : styles.stampLow;
        return (
          <View key={c.id} style={styles.row}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowName}>{c.name || 'Unknown'}</Text>
              <Text style={styles.rowPhone}>{c.phone}</Text>
              {c.stamp_count >= 10 && (
                <View style={styles.readyBadge}>
                  <Text style={styles.readyText}>READY TO REDEEM</Text>
                </View>
              )}
            </View>
            <View style={styles.rowRight}>
              <Text style={stampStyle}>{c.stamp_count}/10</Text>
              <View style={[styles.typeBadge, c.user_type === 'employee' ? styles.typeEmployee : styles.typeCustomer]}>
                <Text style={[styles.typeText, c.user_type === 'employee' ? styles.typeEmployeeText : styles.typeCustomerText]}>
                  {c.user_type.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 48 },
  loading: { flex: 1, backgroundColor: '#0a0f1e', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: '#e8edf5', marginBottom: 4 },
  count: { fontSize: 13, color: 'rgba(232,237,245,0.35)', marginBottom: 24, fontWeight: '500' },

  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#0f1628', borderRadius: 14, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(70,187,255,0.1)',
  },
  rowInfo: { flex: 1 },
  rowName: { fontSize: 15, fontWeight: '700', color: '#46bbff', marginBottom: 2 },
  rowPhone: { fontSize: 12, color: 'rgba(232,237,245,0.4)', fontWeight: '500' },

  stampHigh: { fontSize: 20, fontWeight: '800', color: '#39ff14' },
  stampMid: { fontSize: 20, fontWeight: '800', color: '#ffcc33' },
  stampLow: { fontSize: 20, fontWeight: '800', color: 'rgba(232,237,245,0.35)' },

  readyBadge: { backgroundColor: 'rgba(57,255,20,0.12)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(57,255,20,0.4)', marginTop: 4, alignSelf: 'flex-start' },
  readyText: { color: '#39ff14', fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },

  rowRight: { alignItems: 'flex-end', gap: 6 },
  typeBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  typeCustomer: { backgroundColor: 'rgba(70,187,255,0.1)' },
  typeEmployee: { backgroundColor: 'rgba(255,204,51,0.1)' },
  typeText: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  typeCustomerText: { color: '#46bbff' },
  typeEmployeeText: { color: '#ffcc33' },
});
