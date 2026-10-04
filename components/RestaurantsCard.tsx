import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { Restaurant, RootNavigationProp } from '../src/constants/types';
import { cardShadow, colors, radius } from '../src/themes/design';

interface Props { restaurant?: Restaurant; restaurants?: Restaurant[] }

function ShopCard({ restaurant }: { restaurant: Restaurant }) {
  const navigation = useNavigation<RootNavigationProp>();
  const canJoin = restaurant.isWithinServiceArea === true;
  const locationMissing = restaurant.locationAvailable === false && restaurant.distanceMeters == null;
  const reason = locationMissing ? 'Enable location to join' : 'Outside the 1 km service area';

  return (
    <TouchableOpacity
      activeOpacity={canJoin ? 0.86 : 1}
      onPress={() => canJoin && navigation.navigate('Screens', { screen: 'JoinQueue', params: { restaurant } })}
      style={{ backgroundColor: colors.surface, borderRadius: radius.large, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: canJoin ? '#CBE8F1' : colors.border, opacity: canJoin ? 1 : 0.68, ...cardShadow }}
    >
      <View style={{ position: 'relative' }}>
        <Image source={restaurant.image} style={{ width: '100%', height: 150 }} resizeMode="cover" />
        {!canJoin && <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(15,23,42,0.30)' }} />}
        <View style={{ position: 'absolute', top: 12, left: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: canJoin ? colors.successSoft : '#F1F5F9', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 6 }}>
          <Ionicons name={canJoin ? 'location' : 'lock-closed'} size={13} color={canJoin ? colors.success : colors.textMuted} />
          <Text style={{ marginLeft: 4, color: canJoin ? '#15803D' : colors.textMuted, fontSize: 12, fontWeight: '700' }}>{canJoin ? `${restaurant.distance} away` : restaurant.distance}</Text>
        </View>
      </View>
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }} numberOfLines={1}>{restaurant.name}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }} numberOfLines={1}>{restaurant.shopType || 'Restaurant'}</Text>
          </View>
          <View style={{ backgroundColor: colors.primarySoft, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 7, alignItems: 'center' }}>
            <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 15 }}>{restaurant.waitInfo}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 10 }}>waiting</Text>
          </View>
        </View>
        <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: 10 }} numberOfLines={2}>{restaurant.cuisine}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14 }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name={canJoin ? 'checkmark-circle' : 'information-circle'} size={18} color={canJoin ? colors.success : colors.warning} />
            <Text style={{ flex: 1, marginLeft: 6, color: canJoin ? colors.success : colors.warning, fontSize: 12, fontWeight: '600' }} numberOfLines={1}>{canJoin ? 'Available to join now' : reason}</Text>
          </View>
          <View style={{ backgroundColor: canJoin ? colors.primary : colors.disabled, borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 10 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '800' }}>{canJoin ? 'Join queue' : 'Unavailable'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function RestaurantsCard({ restaurant, restaurants }: Props) {
  if (restaurant) return <ShopCard restaurant={restaurant} />;
  return <>{(restaurants ?? []).map((item) => <ShopCard key={item.id} restaurant={item} />)}</>;
}
