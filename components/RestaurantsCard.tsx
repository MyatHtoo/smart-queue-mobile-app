import React, { useEffect, useState } from "react";
import { View, Image, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import type { Restaurant, RootNavigationProp } from "../src/constants/types";
import { getShops } from "../src/services/api";

interface Props {
  restaurant?: Restaurant;
  restaurants?: Restaurant[];
}

function SingleCard({ restaurant }: { restaurant: Restaurant }) {
  const { name, cuisine, distance, waitInfo, image, shopType } = restaurant;
  const navigation = useNavigation<RootNavigationProp>();

  const handleJoinQueue = () => {
    navigation.navigate("Screens", { screen: "JoinQueue", params: { restaurant } });
  };

  return (
    <View style={{ marginBottom: 16, borderRadius: 20, borderWidth: 2, borderColor: "#17a2b8", backgroundColor: "white", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", height: 140 }}>

        {/* Left Image */}
        <View style={{ width: "35%" }}>
          <Image
            source={image}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        </View>

        {/* Right Content */}
        <View style={{ width: "65%", paddingHorizontal: 12, paddingVertical: 8, justifyContent: "space-between" }}>
          <View>
            <Text style={{ fontWeight: "600", fontSize: 15, color: "#111" }} numberOfLines={2}>
              {name}
            </Text>

            <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>
              {cuisine} {shopType ? `• ${shopType}` : ''} • {distance}
            </Text>

            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
              <Ionicons name="people" size={14} color="#6B7280" />
              <Text style={{ fontSize: 12, color: "#6B7280", marginLeft: 4 }}>
                {waitInfo} in queue
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleJoinQueue}
            style={{ backgroundColor: "#17a2b8", paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, alignSelf: "flex-start" }}
          >
            <Text style={{ color: "white", fontSize: 11, fontWeight: "600" }}>
              Join Queue
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

export default function RestaurantsCard({ restaurant, restaurants }: Props) {
  const [shops, setShops] = useState<Restaurant[]>(restaurants ?? []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (restaurant || restaurants) return; // don't fetch when a single restaurant or list is provided

    let mounted = true;
    const fetchShops = async () => {
      setLoading(true);
      try {
        const data = await getShops();
        // backend may return array or { data: [...] } or { shops: [...] }
        const items: any[] = Array.isArray(data) ? data : data?.data ?? data?.shops ?? [];

        const mapped: Restaurant[] = items.map((s: any) => ({
          id: s._id || s.id || String(s.shopId || Math.random()),
          name: s.name || s.title || 'Unnamed Shop',
          cuisine: s.description ? String(s.description).slice(0, 40) : (s.cuisine || 'Various'),
          shopType: Array.isArray(s.shopTypes)
            ? s.shopTypes.map((t: any) => (typeof t === 'string' ? t : (t?.name || String(t)))).join(', ')
            : (s.shopType || (typeof s.shopTypes === 'string' ? s.shopTypes : '')),
          distance: s.distance || '—',
          waitInfo: (Array.isArray(s.tableTypes) ? String(s.tableTypes.length) : (s.waitInfo != null ? String(s.waitInfo) : '0')),
          image: s.shopImg ? { uri: s.shopImg } : (s.image ? (typeof s.image === 'string' ? { uri: s.image } : s.image) : require('../assets/images/Thai.jpg')),
        }));

        if (mounted) setShops(mapped);
      } catch (e) {
        console.warn('Failed to load shops:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchShops();
    return () => { mounted = false; };
  }, [restaurant, restaurants]);

  if (restaurant) return <SingleCard restaurant={restaurant} />;

  if (restaurants) {
    return (
      <ScrollView>
        {restaurants.map((r) => (
          <SingleCard key={r.id} restaurant={r} />
        ))}
      </ScrollView>
    );
  }

  if (loading) return <ActivityIndicator size="large" color="#17a2b8" style={{ marginTop: 24 }} />;

  return (
    <ScrollView>
      {shops.map((r) => (
        <SingleCard key={r.id} restaurant={r} />
      ))}
    </ScrollView>
  );
}
