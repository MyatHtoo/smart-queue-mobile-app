import { ScrollView, View, ActivityIndicator } from "react-native";
import { Searchbar, Chip } from "react-native-paper";
import { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import RestaurantsCard from "../../components/RestaurantsCard";
import { getShops } from "../../src/services/api";

const FALLBACK_COORDS = {
  latitude: 20.048089972909867,
  longitude: 99.89494063617323,
};

const getDistanceInMeters = (
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number
) => {
  const earthRadius = 6371e3;
  const latitude1Radians = (latitude1 * Math.PI) / 180;
  const latitude2Radians = (latitude2 * Math.PI) / 180;
  const deltaLatitude = ((latitude2 - latitude1) * Math.PI) / 180;
  const deltaLongitude = ((longitude2 - longitude1) * Math.PI) / 180;

  const a =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(latitude1Radians) *
      Math.cos(latitude2Radians) *
      Math.sin(deltaLongitude / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
};

export default function HomePage() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [shops, setShops] = useState<any[]>([]);
  const [rawApiShops, setRawApiShops] = useState<any[]>([]);
  const [loadingShops, setLoadingShops] = useState(false);
  const [userCoords, setUserCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    // fetch shops to derive categories and use for listing
    let mounted = true;
    const fetchShops = async () => {
      setLoadingShops(true);
      try {
        const data = await getShops();
        const items = (Array.isArray(data) ? data : data?.data ?? data?.shops ?? []) as any[];
        if (!mounted) return;
        setRawApiShops(items);
      } catch (e) {
        console.warn('Error fetching shops for HomePage:', e);
      } finally {
        if (mounted) setLoadingShops(false);
      }
    };
    fetchShops();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;
    let mounted = true;

    const startLocationTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setUserCoords(FALLBACK_COORDS);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        if (!mounted) return;

        setUserCoords({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 3000,
            distanceInterval: 5,
          },
          (newLocation) => {
            if (!mounted) return;
            setUserCoords({
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude,
            });
          }
        );
      } catch (error) {
        console.warn("Location tracking error:", error);
        if (mounted) setUserCoords(FALLBACK_COORDS);
      }
    };

    startLocationTracking();

    return () => {
      mounted = false;
      locationSubscription?.remove();
    };
  }, []);

  useEffect(() => {
    if (!userCoords || rawApiShops.length === 0) return;

    const shopsWithDistance = rawApiShops.map((shop: any) => {
      const longitude = Number(
        shop.address?.location?.coordinates?.[0] ?? shop.longitude
      );
      const latitude = Number(
        shop.address?.location?.coordinates?.[1] ?? shop.latitude
      );
      const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
      const distance = hasCoordinates
        ? getDistanceInMeters(
            userCoords.latitude,
            userCoords.longitude,
            latitude,
            longitude
          )
        : null;

      return {
        ...shop,
        calculatedDistance: distance === null
          ? "—"
          : distance < 1000
            ? `${Math.round(distance)}m`
            : `${(distance / 1000).toFixed(1)}km`,
        isWithin2km: distance !== null && distance <= 2000,
      };
    });

    setShops(shopsWithDistance);

    const values = shopsWithDistance.flatMap((shop: any) => {
      const shopValues = [String(shop.cuisine || shop.type || "Other")];
      if (Array.isArray(shop.shopTypes)) {
        shopValues.push(
          ...shop.shopTypes.map((type: any) =>
            typeof type === "string" ? type : String(type?.name || type)
          )
        );
      } else if (shop.shopType || typeof shop.shopTypes === "string") {
        shopValues.push(String(shop.shopType || shop.shopTypes));
      }
      return shopValues;
    });

    setCategories(["All", ...Array.from(new Set(values)).filter(Boolean)]);
  }, [rawApiShops, userCoords]);

  const filteredRestaurants = selectedCategory === "All"
    ? shops
    : shops.filter((s: any) => {
      const cuisineVal = String(s.cuisine || s.type || "Other");
      const shopTypeVal = Array.isArray(s.shopTypes)
        ? s.shopTypes.map((t: any) => (typeof t === "string" ? t : (t?.name || String(t)))).join(", ")
        : (s.shopType || (typeof s.shopTypes === "string" ? s.shopTypes : ""));
      return cuisineVal === selectedCategory || shopTypeVal.split(", ").includes(selectedCategory);
    });

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>

      {/* Search Bar */}
      <View style={{  paddingTop: 10, paddingBottom: 12, backgroundColor: 'white' }}>
        <Searchbar
          placeholder="Search restaurants..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={() => {
            (navigation.navigate as any)('Screens', { screen: 'Search', params: { query: searchQuery } });
          }}
          onFocus={() => {
            (navigation.navigate as any)('Screens', { screen: 'Search', params: { query: searchQuery } });
          }}
          style={{ backgroundColor: "#F5F5F5", borderRadius: 20, marginLeft: 15, marginRight: 15 }}
          elevation={0}
          iconColor="#00000"
        />
      </View>

      {/* Category Chips */}
      <View className="pb-2 bg-white">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingVertical: 12 }}
        >
          {categories.map((category) => (
            <Chip
              key={category}
              selected={selectedCategory === category}
              onPress={() => setSelectedCategory(category)}
              mode="flat"
              showSelectedCheck={false}
              style={{
                backgroundColor:
                  selectedCategory === category ? "#17a2b8" : "#F5F5F5",
                borderRadius: 20,
                height: 32
              }}
              textStyle={{
                color: selectedCategory === category ? "#FFFFFF" : "#666666",
                fontSize: 13,
                fontWeight: selectedCategory === category ? "600" : "400",
              }}
            >
              {category}
            </Chip>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 16, paddingTop: 15, paddingHorizontal: 16 }}
        className="bg-white"
      >
        {loadingShops ? (
          <ActivityIndicator size="large" color="#17a2b8" style={{ marginTop: 24 }} />
        ) : (
          <RestaurantsCard restaurants={filteredRestaurants.map((s: any) => ({
            id: s._id || s.id || String(s.shopId || Math.random()),
            name: s.name || s.title || "Unnamed Shop",
            cuisine: s.cuisine || s.type || "Various",
            shopType: Array.isArray(s.shopTypes)
              ? s.shopTypes.map((t: any) => (typeof t === "string" ? t : (t?.name || String(t)))).join(", ")
              : (s.shopType || (typeof s.shopTypes === "string" ? s.shopTypes : "")),
            distance: s.calculatedDistance || "—",
            isWithin2km: s.isWithin2km,
            waitInfo: Array.isArray(s.tableTypes)
              ? String(s.tableTypes.length)
              : (s.waitInfo != null ? String(s.waitInfo) : "0"),
            image: s.shopImg ? { uri: s.shopImg } : require("../../assets/images/Thai.jpg"),
          }))} />
        )}
      </ScrollView>
    </View>
  );
}