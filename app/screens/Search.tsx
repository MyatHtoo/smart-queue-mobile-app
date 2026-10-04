import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { useRoute } from '@react-navigation/native';
import RestaurantsCard from '../../components/RestaurantsCard';
import { useNearbyShops } from '../../src/hooks/useNearbyShops';
import { colors, radius } from '../../src/themes/design';

export default function SearchScreen() {
  const route = useRoute();
  const [query, setQuery] = useState(String((route.params as any)?.query ?? ''));
  const { shops, loading } = useNearbyShops();
  const results = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return shops;
    return shops.filter((shop) => `${shop.name} ${shop.shopType} ${shop.cuisine} ${shop.address}`.toLowerCase().includes(value));
  }, [query, shops]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <Searchbar autoFocus placeholder="Search shops, food or address" value={query} onChangeText={setQuery} elevation={0} style={{ backgroundColor: '#F1F5F9', borderRadius: radius.medium }} />
        <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 12 }}>{loading ? 'Finding nearby shops…' : `${results.length} ${results.length === 1 ? 'shop' : 'shops'} found • nearest first`}</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
        {loading ? <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} /> : results.length ? <RestaurantsCard restaurants={results} /> : (
          <View style={{ alignItems: 'center', paddingTop: 70 }}><Ionicons name="search-outline" size={54} color={colors.disabled} /><Text style={{ color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 15 }}>No shops found</Text><Text style={{ color: colors.textMuted, marginTop: 6 }}>Try a different shop name, food type or address.</Text></View>
        )}
      </ScrollView>
    </View>
  );
}
