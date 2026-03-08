import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AdminLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0a0f1e', borderTopColor: 'rgba(70,187,255,0.15)', borderTopWidth: 1 },
        tabBarActiveTintColor: '#46bbff',
        tabBarInactiveTintColor: 'rgba(232,237,245,0.3)',
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Overview', tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart" size={size} color={color} /> }} />
      <Tabs.Screen name="customers" options={{ title: 'Customers', tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} /> }} />
      <Tabs.Screen name="offers" options={{ title: 'Offers', tabBarIcon: ({ color, size }) => <Ionicons name="gift" size={size} color={color} /> }} />
    </Tabs>
  );
}
