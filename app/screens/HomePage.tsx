import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Chip, Searchbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import RestaurantsCard from '../../components/RestaurantsCard';
import { useNearbyShops } from '../../src/hooks/useNearbyShops';
import { colors, radius } from '../../src/themes/design';

export default function HomePage() {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'nearby' | 'available'>('all');
  const { shops, loading, refreshing, locationStatus, error, reload } = useNearbyShops();
  const nearbyCount = shops.filter((shop) => shop.isWithinServiceArea).length;
  const visible = useMemo(() => shops.filter((shop) => {
    const matches = `${shop.name} ${shop.shopType} ${shop.cuisine}`.toLowerCase().includes(query.trim().toLowerCase());
    return matches && (filter === 'all' || shop.isWithinServiceArea);
  }), [filter, query, shops]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={reload} colors={[colors.primary]} />} contentContainerStyle={{ paddingBottom: 28 }}>
        <View style={{ backgroundColor: colors.primary, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 30, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}>
          <Text style={{ color: '#CBE8F1', fontSize: 13, fontWeight: '700' }}>SMART QUEUE</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 26, fontWeight: '900', marginTop: 5 }}>Skip the line.</Text>
          <Text style={{ color: '#E0F1F6', fontSize: 14, marginTop: 6 }}>Find a nearby shop and join before you arrive.</Text>
          <Searchbar
            placeholder="Search shops or cuisine"
            value={query}
            onChangeText={setQuery}
            onFocus={() => (navigation.navigate as any)('Screens', { screen: 'Search', params: { query } })}
            style={{ marginTop: 20, borderRadius: radius.medium, backgroundColor: '#FFFFFF', height: 50 }}
            inputStyle={{ minHeight: 0 }}
            elevation={0}
          />
        </View>

        <View style={{ marginHorizontal: 16, marginTop: -16, padding: 15, borderRadius: radius.medium, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: locationStatus === 'granted' ? colors.successSoft : colors.warningSoft, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name={locationStatus === 'granted' ? 'navigate' : 'location-outline'} size={21} color={locationStatus === 'granted' ? colors.success : colors.warning} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: colors.text, fontWeight: '800', fontSize: 14 }}>{locationStatus === 'granted' ? `${nearbyCount} shops within 1 km` : 'Location access required'}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 3 }}>{locationStatus === 'granted' ? 'Only nearby shops can accept your queue' : 'Enable location to check queue eligibility'}</Text>
          </View>
          <TouchableOpacity onPress={reload}><Ionicons name="refresh" size={21} color={colors.primary} /></TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8, gap: 8 }}>
          {[['all', 'All shops'], ['nearby', 'Within 1 km'], ['available', 'Join now']].map(([value, label]) => (
            <Chip key={value} selected={filter === value} showSelectedCheck={false} onPress={() => setFilter(value as any)} style={{ backgroundColor: filter === value ? colors.primary : '#FFFFFF', borderWidth: 1, borderColor: filter === value ? colors.primary : colors.border }} textStyle={{ color: filter === value ? '#FFFFFF' : colors.textMuted, fontWeight: '700' }}>{label}</Chip>
          ))}
        </ScrollView>

        <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ color: colors.text, fontWeight: '900', fontSize: 20 }}>{filter === 'all' ? 'Shops near you' : 'Available nearby'}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>{visible.length} found</Text>
          </View>
          {loading ? <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 40 }} /> : error ? (
            <View style={{ padding: 24, alignItems: 'center' }}><Ionicons name="cloud-offline-outline" size={44} color={colors.textMuted} /><Text style={{ color: colors.text, fontWeight: '800', marginTop: 12 }}>Could not load shops</Text><Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 6 }}>{error}</Text></View>
          ) : visible.length ? <RestaurantsCard restaurants={visible} /> : (
            <View style={{ padding: 32, alignItems: 'center' }}><Ionicons name="storefront-outline" size={48} color={colors.disabled} /><Text style={{ color: colors.text, fontWeight: '800', marginTop: 12 }}>No matching shops</Text><Text style={{ color: colors.textMuted, marginTop: 5 }}>Try another search or filter.</Text></View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
