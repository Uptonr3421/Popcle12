import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Dimensions, Linking,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { playSuccess, playError } from '@/lib/feedback';
import { getActiveDeals, getStaffInstruction, ActiveDeal } from '@/lib/deals';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

export default function StaffScanner() {
  const { phone } = useAuth();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [sessionDate, setSessionDate] = useState(getTodayKey());
  const [activeDeals, setActiveDeals] = useState<ActiveDeal[]>([]);
  const [flash, setFlash] = useState<{ visible: boolean; type: 'success' | 'error'; message: string }>({
    visible: false, type: 'success', message: '',
  });
  const flashAnim = useRef(new Animated.Value(0)).current;
  const lastScannedPhone = useRef<string | null>(null);
  const lastScannedTime = useRef<number>(0);

  useEffect(() => {
    // Daily reset: if stored date doesn't match today, reset count
    const today = getTodayKey();
    if (sessionDate !== today) {
      setSessionCount(0);
      setSessionDate(today);
    }
  }, [sessionDate]);

  useEffect(() => {
    Camera.requestCameraPermissionsAsync().then(({ status }) => {
      setHasPermission(status === 'granted');
    });

    // Fetch active deals on mount and refresh every 60s
    const fetchDeals = async () => {
      const deals = await getActiveDeals();
      setActiveDeals(deals);
    };
    fetchDeals();
    const dealInterval = setInterval(fetchDeals, 60000);
    return () => clearInterval(dealInterval);
  }, []);

  const showFlash = (type: 'success' | 'error', message: string) => {
    setFlash({ visible: true, type, message });
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(flashAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setFlash(prev => ({ ...prev, visible: false })));
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    const customerPhone = data.replace(/\D/g, '');
    if (customerPhone.length !== 10) {
      await playError();
      showFlash('error', 'Invalid QR Code');
      setTimeout(() => setScanned(false), 5000);
      return;
    }

    // Duplicate scan protection: same phone within 60 seconds
    const now = Date.now();
    if (lastScannedPhone.current === customerPhone && now - lastScannedTime.current < 60000) {
      showFlash('error', 'Already scanned this customer');
      setTimeout(() => setScanned(false), 5000);
      return;
    }

    try {
      // Look up customer and staff in parallel
      const [customerResult, staffResult] = await Promise.all([
        supabase.from('users').select('id, name').eq('phone', customerPhone).single(),
        supabase.from('users').select('id').eq('phone', phone).single(),
      ]);

      const customer = customerResult.data;
      const staff = staffResult.data;

      if (!customer) {
        await playError();
        showFlash('error', 'Customer Not Found');
        setTimeout(() => setScanned(false), 2000);
        return;
      }

      // Atomic stamp increment via Supabase RPC — prevents race conditions
      const { data, error: rpcError } = await supabase.rpc('add_stamp', {
        p_customer_id: customer.id,
        p_employee_id: staff?.id,
      });

      if (rpcError) throw rpcError;

      if (!data.success) {
        if (data.cooldown) {
          await playError();
          showFlash('error', 'Already scanned — wait 60 seconds');
        } else {
          await playError();
          showFlash('error', data.error || 'Stamp failed');
        }
        setTimeout(() => setScanned(false), 2500);
        return;
      }

      await playSuccess();
      setSessionCount(c => c + 1);
      lastScannedPhone.current = customerPhone;
      lastScannedTime.current = Date.now();

      let msg = `${customer.name || 'Customer'} — Stamp ${data.new_count}/10`;
      if (data.celebration) msg = `${customer.name || 'Customer'} — REWARD READY! 🎉`;

      // Append active deal instructions
      if (activeDeals.length > 0) {
        const instruction = getStaffInstruction(activeDeals[0]);
        msg = msg + '\n' + instruction;
      }
      showFlash('success', msg);
    } catch {
      await playError();
      showFlash('error', 'Connection Error');
    }

    setTimeout(() => setScanned(false), 5000);
  };

  const handleSignOut = () => supabase.auth.signOut();

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.permText}>Requesting camera access...</Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container} accessibilityRole="alert">
        <Text style={styles.permText}>Camera access denied.{'\n'}Enable in Settings to scan QR codes.</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 24 }}>
          <TouchableOpacity
            style={{ backgroundColor: '#ffcc33', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 }}
            onPress={() => Linking.openSettings()}
          >
            <Text style={{ color: '#1f1715', fontWeight: '800', fontSize: 15 }}>Open Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: 'rgba(255,204,51,0.15)', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(255,204,51,0.4)' }}
            onPress={async () => {
              const { status } = await Camera.requestCameraPermissionsAsync();
              setHasPermission(status === 'granted');
            }}
          >
            <Text style={{ color: '#ffcc33', fontWeight: '800', fontSize: 15 }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.staffBadge}>
            <Text style={styles.staffBadgeText}>STAFF</Text>
          </View>
          {activeDeals.length > 0 && (
            <View style={styles.dealBadge}>
              <Text style={styles.dealBadgeText}>
                {activeDeals.length} DEAL{activeDeals.length > 1 ? 'S' : ''} ACTIVE
              </Text>
            </View>
          )}
        </View>
        <View style={styles.headerCenter} accessibilityLabel={`${sessionCount} stamps added today`}>
          <Text style={styles.sessionCount}>{sessionCount}</Text>
          <Text style={styles.sessionLabel}>today</Text>
        </View>
        <TouchableOpacity onPress={handleSignOut} style={styles.headerRight}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Active deals panel */}
      {activeDeals.length > 0 && (
        <View style={styles.dealsPanel}>
          {activeDeals.slice(0, 2).map(deal => (
            <View key={deal.id} style={styles.dealChip}>
              <Text style={styles.dealChipLabel}>{deal.discountLabel}</Text>
              <Text style={styles.dealChipTitle}>{deal.title}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Camera */}
      <View style={styles.cameraContainer} accessibilityLabel="QR code scanner camera. Point at customer's QR code." accessibilityRole="image">
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        />
        {/* Corner bracket viewfinder overlay */}
        <View style={styles.viewfinder} pointerEvents="none">
          {/* Top-left */}
          <View style={[styles.corner, styles.cornerTL]} />
          {/* Top-right */}
          <View style={[styles.corner, styles.cornerTR]} />
          {/* Bottom-left */}
          <View style={[styles.corner, styles.cornerBL]} />
          {/* Bottom-right */}
          <View style={[styles.corner, styles.cornerBR]} />
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.footer}>
        <Text style={styles.instructions}>Point camera at customer's QR code</Text>
      </View>

      {/* Full-screen flash overlay */}
      {flash.visible && (
        <Animated.View
          style={[
            styles.flashOverlay,
            {
              backgroundColor: flash.type === 'success' ? '#1a3d1a' : '#3d1a1a',
              opacity: flashAnim,
            },
          ]}
          accessibilityRole="alert"
          accessibilityLabel={flash.type === 'success' ? 'Stamp added successfully' : 'Scan failed'}
        >
          <Text style={styles.flashIcon}>{flash.type === 'success' ? '✓' : '✕'}</Text>
          <Text style={styles.flashMessage}>{flash.message}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const CORNER = 28;
const CORNER_W = 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d' },
  permText: {
    color: '#fff',
    textAlign: 'center',
    padding: 40,
    paddingTop: 120,
    fontSize: 16,
    fontWeight: '600',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 14,
    backgroundColor: '#0d0d0d',
  },
  headerLeft: { flex: 1 },
  headerCenter: { alignItems: 'center' },
  headerRight: { flex: 1, alignItems: 'flex-end' },

  staffBadge: {
    backgroundColor: '#ffcc33',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  staffBadgeText: {
    color: '#1f1715',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },

  dealBadge: {
    backgroundColor: 'rgba(255,204,51,0.15)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,204,51,0.4)',
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  dealBadgeText: { color: '#ffcc33', fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },

  dealsPanel: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,204,51,0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,204,51,0.1)',
  },
  dealChip: {
    backgroundColor: 'rgba(255,204,51,0.1)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,204,51,0.25)',
  },
  dealChipLabel: { fontSize: 14, fontWeight: '800', color: '#ffcc33' },
  dealChipTitle: { fontSize: 10, color: 'rgba(255,204,51,0.6)', fontWeight: '500', marginTop: 1 },

  sessionCount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffcc33',
    lineHeight: 32,
  },
  sessionLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  signOutText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    fontWeight: '500',
  },

  cameraContainer: { flex: 1, position: 'relative' },
  camera: { flex: 1 },

  viewfinder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Corner brackets — L-shaped using borderWidth on specific sides
  corner: { position: 'absolute', width: CORNER, height: CORNER },
  cornerTL: {
    top: '25%',
    left: '15%',
    borderTopWidth: CORNER_W,
    borderLeftWidth: CORNER_W,
    borderColor: '#ffcc33',
  },
  cornerTR: {
    top: '25%',
    right: '15%',
    borderTopWidth: CORNER_W,
    borderRightWidth: CORNER_W,
    borderColor: '#ffcc33',
  },
  cornerBL: {
    bottom: '25%',
    left: '15%',
    borderBottomWidth: CORNER_W,
    borderLeftWidth: CORNER_W,
    borderColor: '#ffcc33',
  },
  cornerBR: {
    bottom: '25%',
    right: '15%',
    borderBottomWidth: CORNER_W,
    borderRightWidth: CORNER_W,
    borderColor: '#ffcc33',
  },

  footer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#0d0d0d',
    alignItems: 'center',
  },
  instructions: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  flashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  flashIcon: {
    fontSize: 72,
    color: '#fff',
    marginBottom: 16,
    fontWeight: '800',
  },
  flashMessage: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
