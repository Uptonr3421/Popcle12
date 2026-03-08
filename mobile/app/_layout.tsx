import { useEffect, useState } from 'react';
import { Stack, Redirect, useSegments, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { useAuth } from '@/hooks/useAuth';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ErrorBoundary from '@/components/ErrorBoundary';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, role, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('@popcle_onboarded').then((val) => setOnboarded(val === 'true'));
  }, []);

  useEffect(() => {
    if (loading || onboarded === null) return;

    const inAuthGroup = segments[0] === 'auth';
    const inOnboarding = segments[0] === 'onboarding';

    if (!onboarded && !inOnboarding) {
      router.replace('/onboarding');
      return;
    }

    if (!session && !inAuthGroup && !inOnboarding) {
      router.replace('/auth');
    } else if (session && inAuthGroup) {
      if (role === 'admin') router.replace('/(admin)');
      else if (role === 'employee') router.replace('/(staff)');
      else router.replace('/(customer)');
    }
  }, [session, role, loading, segments, onboarded]);

  // ── Deep linking: popculturecle:// scheme ────────────────────────────────
  useEffect(() => {
    if (!session) return; // Only handle deep links when authenticated

    const handleDeepLink = (event: { url: string }) => {
      const parsed = Linking.parse(event.url);
      if (parsed.path === 'offers') router.push('/(customer)/offers');
      else if (parsed.path === 'stamps') router.push('/(customer)/');
      else if (parsed.path === 'connect') router.push('/(customer)/connect');
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Handle cold launch deep link
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription?.remove();
  }, [session, router]);

  if (loading || onboarded === null) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f0a1a' }}>
        <ActivityIndicator size="large" color="#f5d547" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthGate>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="(customer)" />
          <Stack.Screen name="(staff)" />
          <Stack.Screen name="(admin)" />
        </Stack>
      </AuthGate>
    </ErrorBoundary>
  );
}
