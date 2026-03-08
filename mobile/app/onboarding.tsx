import { useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    icon: 'star' as const,
    title: 'Earn Stamps',
    description: 'Visit Pop Culture CLE and earn a stamp on every purchase',
  },
  {
    id: '2',
    icon: 'pricetag' as const,
    title: 'Get Deals',
    description: 'Receive exclusive deals and offers pushed right to your phone',
  },
  {
    id: '3',
    icon: 'trophy' as const,
    title: 'Free Rewards',
    description: 'Collect 10 stamps and get a free item on us!',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem('@popcle_onboarded', 'true');
    router.replace('/auth');
  };

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.slide} accessibilityLabel={`${item.title}. ${item.description}`}>
            <View style={styles.card}>
              <View style={styles.iconCircle}>
                <Ionicons name={item.icon} size={80} color="#ff3b8d" />
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        )}
      />

      {/* Dot indicators */}
      <View style={styles.dotsRow}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === currentIndex ? styles.dotActive : styles.dotInactive]}
            accessibilityLabel={`Page ${i + 1} of ${slides.length}`}
          />
        ))}
      </View>

      {/* CTA button */}
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={isLastSlide ? handleGetStarted : handleNext}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={isLastSlide ? 'Get Started' : 'Next'}
      >
        <Text style={styles.ctaText}>{isLastSlide ? 'Get Started' : 'Next'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff9f5',
    paddingBottom: 60,
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 36,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1f1715',
    shadowColor: '#1f1715',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
    width: '100%',
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,59,141,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ff3b8d',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: 'rgba(31,23,21,0.6)',
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotActive: {
    backgroundColor: '#ff3b8d',
    width: 28,
    borderRadius: 5,
  },
  dotInactive: {
    backgroundColor: 'rgba(31,23,21,0.2)',
  },
  ctaButton: {
    backgroundColor: '#ff3b8d',
    marginHorizontal: 32,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#ff3b8d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  ctaText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
