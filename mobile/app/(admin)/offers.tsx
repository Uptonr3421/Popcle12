// SQL migration required before geofence fields will work:
// ALTER TABLE offers
// ADD COLUMN IF NOT EXISTS lat float8,
// ADD COLUMN IF NOT EXISTS lng float8,
// ADD COLUMN IF NOT EXISTS radius_meters integer DEFAULT 200;

import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  TouchableOpacity, Alert, Switch, TextInput,
} from 'react-native';
import { supabase } from '@/lib/supabase';

interface Offer {
  id: string;
  title: string;
  description: string;
  discount_percentage: number | null;
  free_item: boolean;
  expires_at: string;
  active: boolean;
  geofence_enabled: boolean;
  lat: number | null;
  lng: number | null;
  radius_meters: number | null;
  created_at: string;
}

export default function AdminOffersScreen() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // New offer form state
  const [offerTitle, setOfferTitle] = useState('');
  const [offerDescription, setOfferDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'free_item'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [geofenceEnabled, setGeofenceEnabled] = useState(false);
  const [offerLat, setOfferLat] = useState('');
  const [offerLng, setOfferLng] = useState('');
  const [offerRadius, setOfferRadius] = useState('200');

  useEffect(() => { fetchOffers(); }, []);

  const fetchOffers = async () => {
    const { data } = await supabase
      .from('offers')
      .select('*')
      .order('created_at', { ascending: false });
    setOffers(data || []);
    setLoading(false);
  };

  const handleCreateOffer = async () => {
    if (!offerTitle.trim() || !offerDescription.trim() || !expiresAt.trim()) {
      Alert.alert('Missing Fields', 'Please fill in title, description, and expiry date.');
      return;
    }

    if (offerTitle.trim().length > 200) {
      Alert.alert('Title Too Long', 'Title must be 200 characters or less.');
      return;
    }

    if (offerDescription.trim().length > 1000) {
      Alert.alert('Description Too Long', 'Description must be 1000 characters or less.');
      return;
    }

    if (discountType === 'percentage' && discountValue.trim()) {
      const pct = parseInt(discountValue, 10);
      if (isNaN(pct) || pct < 0 || pct > 100) {
        Alert.alert('Invalid Discount', 'Discount must be between 0% and 100%.');
        return;
      }
    }

    if (geofenceEnabled) {
      if (!offerLat.trim() || !offerLng.trim()) {
        Alert.alert('Missing Geofence Data', 'Please enter latitude and longitude for the geofence.');
        return;
      }
      const lat = parseFloat(offerLat);
      const lng = parseFloat(offerLng);
      const radius = parseInt(offerRadius, 10);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        Alert.alert('Invalid Latitude', 'Latitude must be between -90 and 90.');
        return;
      }
      if (isNaN(lng) || lng < -180 || lng > 180) {
        Alert.alert('Invalid Longitude', 'Longitude must be between -180 and 180.');
        return;
      }
      if (isNaN(radius) || radius < 50 || radius > 5000) {
        Alert.alert('Invalid Radius', 'Radius must be between 50 and 5000 meters.');
        return;
      }
    }

    setCreating(true);
    try {
      const { error } = await supabase.from('offers').insert([
        {
          title: offerTitle.trim(),
          description: offerDescription.trim(),
          discount_percentage: discountType === 'percentage' ? parseInt(discountValue) || null : null,
          free_item: discountType === 'free_item',
          expires_at: new Date(expiresAt).toISOString(),
          active: true,
          geofence_enabled: geofenceEnabled,
          lat: geofenceEnabled ? parseFloat(offerLat) : null,
          lng: geofenceEnabled ? parseFloat(offerLng) : null,
          radius_meters: geofenceEnabled ? parseInt(offerRadius) : null,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      Alert.alert('Success', 'Offer created successfully!');
      // Reset form
      setOfferTitle('');
      setOfferDescription('');
      setDiscountType('percentage');
      setDiscountValue('');
      setExpiresAt('');
      setGeofenceEnabled(false);
      setOfferLat('');
      setOfferLng('');
      setOfferRadius('200');
      setShowForm(false);
      await fetchOffers();
    } catch (err) {
      Alert.alert('Error', 'Failed to create offer. Please try again.');
      console.error('Create offer error:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (offer: Offer) => {
    const action = offer.active ? 'deactivate' : 'activate';
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Offer`,
      `Are you sure you want to ${action} "${offer.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setToggling(offer.id);
            const { error } = await supabase
              .from('offers')
              .update({ active: !offer.active })
              .eq('id', offer.id);
            if (!error) {
              setOffers(prev =>
                prev.map(o => o.id === offer.id ? { ...o, active: !o.active } : o)
              );
            }
            setToggling(null);
          },
        },
      ]
    );
  };

  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color="#46bbff" /></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Offers</Text>
      <Text style={styles.count}>{offers.length} total</Text>

      {/* Create Offer Toggle */}
      <TouchableOpacity style={styles.createButton} onPress={() => setShowForm(!showForm)}>
        <Text style={styles.createButtonText}>{showForm ? '✕  Cancel' : '+ Create New Offer'}</Text>
      </TouchableOpacity>

      {/* Create Offer Form */}
      {showForm && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>New Offer</Text>

          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={offerTitle}
            onChangeText={setOfferTitle}
            placeholder="e.g., Free Topping Tuesday"
            placeholderTextColor="rgba(232,237,245,0.2)"
            accessibilityLabel="Offer title"
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={offerDescription}
            onChangeText={setOfferDescription}
            placeholder="Describe your offer"
            placeholderTextColor="rgba(232,237,245,0.2)"
            multiline
            numberOfLines={3}
            accessibilityLabel="Offer description"
          />

          <Text style={styles.label}>Discount Type</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.typeButton, discountType === 'percentage' && styles.typeButtonActive]}
              onPress={() => setDiscountType('percentage')}
            >
              <Text style={[styles.typeButtonText, discountType === 'percentage' && styles.typeButtonTextActive]}>% Off</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, discountType === 'free_item' && styles.typeButtonActive]}
              onPress={() => setDiscountType('free_item')}
            >
              <Text style={[styles.typeButtonText, discountType === 'free_item' && styles.typeButtonTextActive]}>Free Item</Text>
            </TouchableOpacity>
          </View>

          {discountType === 'percentage' && (
            <>
              <Text style={styles.label}>Discount %</Text>
              <TextInput
                style={styles.input}
                value={discountValue}
                onChangeText={setDiscountValue}
                placeholder="e.g., 20"
                placeholderTextColor="rgba(232,237,245,0.2)"
                keyboardType="numeric"
                accessibilityLabel="Discount percentage"
              />
            </>
          )}

          <Text style={styles.label}>Expires At (YYYY-MM-DD HH:MM)</Text>
          <TextInput
            style={styles.input}
            value={expiresAt}
            onChangeText={setExpiresAt}
            placeholder="e.g., 2026-12-31 23:59"
            placeholderTextColor="rgba(232,237,245,0.2)"
            accessibilityLabel="Expiration date and time"
          />

          {/* Geofence Section */}
          <View style={styles.geofenceSection}>
            <View style={styles.geofenceToggleRow}>
              <Text style={styles.geofenceLabel}>Enable Geofencing</Text>
              <Switch
                value={geofenceEnabled}
                onValueChange={setGeofenceEnabled}
                trackColor={{ false: 'rgba(70,187,255,0.1)', true: 'rgba(70,187,255,0.35)' }}
                thumbColor={geofenceEnabled ? '#46bbff' : 'rgba(232,237,245,0.3)'}
              />
            </View>
            <Text style={styles.geofenceHint}>
              When enabled, customers nearby receive push notifications about this offer.
            </Text>

            {geofenceEnabled && (
              <View style={styles.geofenceFields}>
                <Text style={styles.label}>Latitude</Text>
                <TextInput
                  style={styles.input}
                  value={offerLat}
                  onChangeText={setOfferLat}
                  placeholder="e.g., 41.4384"
                  placeholderTextColor="rgba(232,237,245,0.2)"
                  keyboardType="decimal-pad"
                  accessibilityLabel="Geofence latitude"
                />

                <Text style={styles.label}>Longitude</Text>
                <TextInput
                  style={styles.input}
                  value={offerLng}
                  onChangeText={setOfferLng}
                  placeholder="e.g., -81.4096"
                  placeholderTextColor="rgba(232,237,245,0.2)"
                  keyboardType="decimal-pad"
                  accessibilityLabel="Geofence longitude"
                />

                <Text style={styles.label}>Radius (meters)</Text>
                <TextInput
                  style={styles.input}
                  value={offerRadius}
                  onChangeText={setOfferRadius}
                  placeholder="200"
                  placeholderTextColor="rgba(232,237,245,0.2)"
                  keyboardType="numeric"
                  accessibilityLabel="Geofence radius in meters"
                />
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.submitButton, creating && styles.buttonDisabled]}
            onPress={handleCreateOffer}
            disabled={creating}
          >
            {creating
              ? <ActivityIndicator size="small" color="#0a0f1e" />
              : <Text style={styles.submitButtonText}>Create Offer</Text>
            }
          </TouchableOpacity>
        </View>
      )}

      {/* Offers List */}
      {offers.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No offers created yet</Text>
        </View>
      ) : (
        offers.map((offer) => (
          <View key={offer.id} style={[styles.card, !offer.active && styles.cardInactive]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{offer.title}</Text>
                <Text style={styles.cardDiscount}>
                  {offer.free_item ? 'FREE ITEM' : offer.discount_percentage ? `${offer.discount_percentage}% OFF` : 'Special Offer'}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.toggleButton, offer.active ? styles.toggleActive : styles.toggleInactive]}
                onPress={() => handleToggleActive(offer)}
                disabled={toggling === offer.id}
                accessibilityRole="switch"
                accessibilityState={{ checked: offer.active }}
              >
                {toggling === offer.id
                  ? <ActivityIndicator size="small" color="#e8edf5" />
                  : <Text style={[styles.toggleText, offer.active ? styles.toggleTextActive : styles.toggleTextInactive]}>
                      {offer.active ? 'Active' : 'Inactive'}
                    </Text>
                }
              </TouchableOpacity>
            </View>
            <Text style={styles.cardDesc}>{offer.description}</Text>
            <Text style={styles.cardExpires}>
              Expires: {new Date(offer.expires_at).toLocaleDateString()}
            </Text>
            {offer.geofence_enabled && (
              <View style={styles.geofenceBadge}>
                <Text style={styles.geofenceBadgeText}>
                  Geofence {offer.lat ? `(${offer.lat.toFixed(4)}, ${offer.lng?.toFixed(4)}) — ${offer.radius_meters ?? 200}m` : 'enabled'}
                </Text>
              </View>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 48 },
  loading: { flex: 1, backgroundColor: '#0a0f1e', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: '#e8edf5', marginBottom: 4 },
  count: { fontSize: 13, color: 'rgba(232,237,245,0.35)', marginBottom: 20, fontWeight: '500' },

  createButton: {
    backgroundColor: 'rgba(70,187,255,0.1)', borderRadius: 12, padding: 14,
    alignItems: 'center', marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(70,187,255,0.35)',
  },
  createButtonText: { color: '#46bbff', fontWeight: '700', fontSize: 15, letterSpacing: 0.5 },

  formCard: {
    backgroundColor: '#0f1628', borderRadius: 16, padding: 20, marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(70,187,255,0.15)',
  },
  formTitle: { fontSize: 18, fontWeight: '800', color: '#e8edf5', marginBottom: 16 },
  label: {
    fontSize: 11, color: 'rgba(232,237,245,0.4)', marginBottom: 6, marginTop: 12,
    letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: '700',
  },
  input: {
    backgroundColor: '#0a0f1e', borderRadius: 10, padding: 12,
    color: '#e8edf5', borderWidth: 1, borderColor: 'rgba(70,187,255,0.2)', fontSize: 15,
  },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
  toggleRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  typeButton: {
    flex: 1, padding: 10, borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(70,187,255,0.15)', alignItems: 'center',
  },
  typeButtonActive: { backgroundColor: 'rgba(70,187,255,0.12)', borderColor: 'rgba(70,187,255,0.5)' },
  typeButtonText: { color: 'rgba(232,237,245,0.4)', fontWeight: '600' },
  typeButtonTextActive: { color: '#46bbff' },

  geofenceSection: {
    marginTop: 16, padding: 14, backgroundColor: '#0a0f1e',
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(70,187,255,0.15)',
  },
  geofenceToggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  geofenceLabel: { fontSize: 14, color: '#e8edf5', fontWeight: '600' },
  geofenceHint: { fontSize: 12, color: 'rgba(232,237,245,0.3)', marginTop: 6 },
  geofenceFields: { marginTop: 12 },

  submitButton: {
    backgroundColor: '#46bbff', borderRadius: 12, padding: 16,
    alignItems: 'center', marginTop: 20,
  },
  buttonDisabled: { opacity: 0.5 },
  submitButtonText: { fontSize: 16, fontWeight: '800', color: '#0a0f1e' },

  empty: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, color: 'rgba(232,237,245,0.35)', fontWeight: '500' },

  card: {
    backgroundColor: '#0f1628', borderRadius: 16, padding: 20, marginBottom: 14,
    borderWidth: 1, borderColor: 'rgba(70,187,255,0.15)',
  },
  cardInactive: { opacity: 0.5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardInfo: { flex: 1, marginRight: 12 },
  cardTitle: { fontSize: 17, fontWeight: '800', color: '#e8edf5', marginBottom: 4 },
  cardDiscount: { fontSize: 14, fontWeight: '700', color: '#46bbff', letterSpacing: 0.5 },
  cardDesc: { fontSize: 14, color: 'rgba(232,237,245,0.55)', marginBottom: 8, lineHeight: 20 },
  cardExpires: { fontSize: 12, color: 'rgba(232,237,245,0.3)', fontWeight: '500' },

  toggleButton: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    minWidth: 80, alignItems: 'center', borderWidth: 1,
  },
  toggleActive: { backgroundColor: 'rgba(57,255,20,0.1)', borderColor: 'rgba(57,255,20,0.4)' },
  toggleInactive: { backgroundColor: 'rgba(232,237,245,0.06)', borderColor: 'rgba(232,237,245,0.15)' },
  toggleText: { fontSize: 12, fontWeight: '700' },
  toggleTextActive: { color: '#39ff14' },
  toggleTextInactive: { color: 'rgba(232,237,245,0.35)' },

  geofenceBadge: {
    marginTop: 8, backgroundColor: 'rgba(70,187,255,0.08)', borderRadius: 8, padding: 8,
    borderWidth: 1, borderColor: 'rgba(70,187,255,0.25)',
  },
  geofenceBadgeText: { color: '#46bbff', fontSize: 12, fontWeight: '600' },
});
