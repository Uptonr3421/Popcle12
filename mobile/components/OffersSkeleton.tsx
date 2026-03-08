import { View, StyleSheet } from 'react-native';
import Skeleton from './Skeleton';

export default function OffersSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Title + subtitle */}
        <Skeleton width={200} height={34} borderRadius={8} style={{ alignSelf: 'center', marginBottom: 6 }} />
        <Skeleton width={240} height={15} borderRadius={6} style={{ alignSelf: 'center', marginBottom: 32 }} />

        {/* 3 offer card skeletons */}
        {Array.from({ length: 3 }).map((_, i) => (
          <View key={i} style={styles.offerCard}>
            {/* Discount label */}
            <Skeleton width={100} height={30} borderRadius={8} style={{ marginBottom: 8 }} />
            {/* Title */}
            <Skeleton width="75%" height={18} borderRadius={6} style={{ marginBottom: 12 }} />
            {/* Description line 1 */}
            <Skeleton width="100%" height={14} borderRadius={4} style={{ marginBottom: 6 }} />
            {/* Description line 2 */}
            <Skeleton width="60%" height={14} borderRadius={4} style={{ marginBottom: 16 }} />
            {/* Countdown row */}
            <View style={styles.countdownRow}>
              <Skeleton width={60} height={10} borderRadius={4} />
              <Skeleton width={90} height={16} borderRadius={6} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff9f5',
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 48,
  },
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
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
});
