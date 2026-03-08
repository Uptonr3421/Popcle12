import { View, StyleSheet } from 'react-native';
import Skeleton from './Skeleton';

export default function StampCardSkeleton() {
  return (
    <View style={styles.container}>
      {/* Header skeleton */}
      <View style={styles.header}>
        <Skeleton width={140} height={20} borderRadius={6} />
        <Skeleton width={90} height={30} borderRadius={20} />
      </View>

      <View style={styles.content}>
        {/* Welcome text */}
        <Skeleton width={180} height={26} borderRadius={8} style={{ alignSelf: 'center', marginBottom: 6 }} />
        <Skeleton width={160} height={14} borderRadius={6} style={{ alignSelf: 'center', marginBottom: 24 }} />

        {/* Stamp card */}
        <View style={styles.stampCard}>
          {/* Label */}
          <Skeleton width={100} height={11} borderRadius={4} style={{ alignSelf: 'center', marginBottom: 12 }} />

          {/* Big stamp count circle */}
          <Skeleton width={72} height={72} borderRadius={36} style={{ alignSelf: 'center', marginBottom: 8 }} />

          {/* "of 10" */}
          <Skeleton width={40} height={14} borderRadius={4} style={{ alignSelf: 'center', marginBottom: 24 }} />

          {/* Stamp grid — row 1 */}
          <View style={styles.stampRow}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={`r1-${i}`} width={46} height={46} borderRadius={23} />
            ))}
          </View>

          {/* Stamp grid — row 2 */}
          <View style={styles.stampRow}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={`r2-${i}`} width={46} height={46} borderRadius={23} />
            ))}
          </View>

          {/* Progress text */}
          <Skeleton width={180} height={15} borderRadius={6} style={{ alignSelf: 'center', marginTop: 20, marginBottom: 16 }} />

          {/* Claim button */}
          <Skeleton width="100%" height={54} borderRadius={16} />
        </View>

        {/* QR code card */}
        <View style={styles.qrCard}>
          <Skeleton width={120} height={18} borderRadius={6} style={{ marginBottom: 6 }} />
          <Skeleton width={180} height={13} borderRadius={4} style={{ marginBottom: 20 }} />
          <Skeleton width={220} height={220} borderRadius={16} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff9f5',
  },
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
  content: {
    paddingHorizontal: 20,
    paddingBottom: 48,
  },
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
  stampRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 10,
  },
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
});
