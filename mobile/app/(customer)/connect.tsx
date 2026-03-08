import { View, Text, TouchableOpacity, StyleSheet, Linking, ScrollView, Platform } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

interface SocialLink {
  platform: string;
  url: string;
  iconName: string;
  iconSet: 'fa5' | 'ion';
  color: string;
  handle: string;
}

const SOCIAL_LINKS: SocialLink[] = [
  {
    platform: 'Instagram',
    url: 'https://www.instagram.com/popculturecle/',
    iconName: 'instagram',
    iconSet: 'fa5',
    color: '#E1306C',
    handle: '@popculturecle',
  },
  {
    platform: 'Facebook',
    url: 'https://www.facebook.com/popculturecle/',
    iconName: 'facebook',
    iconSet: 'fa5',
    color: '#1877F2',
    handle: 'Pop Culture CLE',
  },
  {
    platform: 'LinkedIn',
    url: 'https://www.linkedin.com/company/pop-culture-cle',
    iconName: 'linkedin',
    iconSet: 'fa5',
    color: '#0A66C2',
    handle: 'Pop Culture CLE',
  },
];

const STORE_COORDS = { lat: 41.4384, lng: -81.4096 };

const openDirections = () => {
  const { lat, lng } = STORE_COORDS;
  const url = Platform.select({
    ios: `maps://app?daddr=${lat},${lng}&q=${encodeURIComponent('Pop Culture CLE')}`,
    android: `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent('Pop Culture CLE')})`,
    default: `https://maps.google.com/?daddr=${lat},${lng}`,
  });
  if (url) Linking.openURL(url);
};

export default function ConnectScreen() {
  const openLink = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Connect</Text>
      <Text style={styles.subtitle}>Follow us for specials & updates</Text>

      <View style={styles.links}>
        {SOCIAL_LINKS.map((link) => (
          <TouchableOpacity
            key={link.platform}
            style={styles.linkCard}
            onPress={() => openLink(link.url)}
            activeOpacity={0.75}
            accessibilityLabel={`Open ${link.platform} - ${link.handle}`}
            accessibilityRole="link"
          >
            <View style={[styles.iconBg, { backgroundColor: `${link.color}18` }]}>
              <FontAwesome5 name={link.iconName} size={22} color={link.color} />
            </View>
            <View style={styles.linkText}>
              <Text style={styles.platform}>{link.platform}</Text>
              <Text style={styles.handle}>{link.handle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#ff3b8d" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Store info + Directions */}
      <View style={styles.storeCard}>
        <Text style={styles.storeTitle}>Pop Culture CLE</Text>
        <Text style={styles.storeAddress}>33549 Solon Rd{'\n'}Solon, OH 44139</Text>

        <TouchableOpacity onPress={openDirections} style={styles.directionsBtn} accessibilityLabel="Get directions to Pop Culture CLE" accessibilityRole="link">
          <Ionicons name="navigate" size={18} color="#fff" />
          <Text style={styles.directionsBtnText}>Get Directions</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => openLink('tel:+12162457316')} style={styles.callBtn} accessibilityLabel="Call Pop Culture CLE at 216-245-7316" accessibilityRole="link">
          <Ionicons name="call" size={16} color="#fff" />
          <Text style={styles.callBtnText}>(216) 245-7316</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openLink('mailto:info@popculturecle.com')} style={styles.emailBtn} accessibilityLabel="Email Pop Culture CLE" accessibilityRole="link">
          <Ionicons name="mail-outline" size={16} color="#ff3b8d" />
          <Text style={styles.emailBtnText}>info@popculturecle.com</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>Pop Culture CLE — Solon, OH</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff9f5' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 48 },

  title: { fontSize: 34, fontWeight: '800', color: '#ff3b8d', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 15, color: 'rgba(31,23,21,0.5)', textAlign: 'center', marginBottom: 32, fontWeight: '500' },

  links: { gap: 12, marginBottom: 24 },
  linkCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    borderWidth: 2.5, borderColor: '#1f1715',
    shadowColor: '#1f1715', shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 5,
  },
  iconBg: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 24 },
  linkText: { flex: 1 },
  platform: { fontSize: 16, fontWeight: '700', color: '#1f1715' },
  handle: { fontSize: 13, color: 'rgba(31,23,21,0.5)', marginTop: 1, fontWeight: '500' },
  arrow: { fontSize: 18, color: '#ff3b8d', fontWeight: '700' },

  storeCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 24,
    borderWidth: 2.5, borderColor: '#1f1715',
    shadowColor: '#1f1715', shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 6,
    marginBottom: 32, alignItems: 'center',
  },
  storeTitle: { fontSize: 22, fontWeight: '800', color: '#ff3b8d', marginBottom: 8 },
  storeAddress: { fontSize: 15, color: 'rgba(31,23,21,0.65)', textAlign: 'center', lineHeight: 22, marginBottom: 16, fontWeight: '500' },
  directionsBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#ff7b32', borderRadius: 12, paddingVertical: 14,
    marginBottom: 8, width: '100%',
    shadowColor: '#ff7b32', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
  },
  directionsBtnText: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 0.3 },

  callBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#ff3b8d', borderRadius: 12, paddingVertical: 12,
    marginBottom: 8, width: '100%',
  },
  callBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  emailBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#fff9f5', borderRadius: 12, paddingVertical: 12,
    borderWidth: 2, borderColor: '#ff3b8d', width: '100%',
  },
  emailBtnText: { color: '#ff3b8d', fontWeight: '700', fontSize: 15 },

  footer: { textAlign: 'center', fontSize: 12, color: 'rgba(31,23,21,0.3)', fontWeight: '500', marginTop: 8 },
});
