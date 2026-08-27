import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const getDistanceInMeters = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371e3;

  const radLat1 = (lat1 * Math.PI) / 180;
  const radLat2 = (lat2 * Math.PI) / 180;

  const deltaLat = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLng = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(radLat1) *
      Math.cos(radLat2) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export default function LiveLocationScreen() {
  const navigation = useNavigation();
  const mapRef = useRef<MapView>(null);

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Zoom in closely to the user's location when the map loads
  const zoomToUserLocation = (coords: {
    latitude: number;
    longitude: number;
  }) => {
    mapRef.current?.animateCamera(
      {
        center: coords,
        zoom: 18.5,
      },
      { duration: 800 }
    );
  };

  // Fetch registered shops from the backend API
  const fetchShops = async () => {
    try {
      const res = await fetch(
        "https://smart-q-backend-nestjs.onrender.com/api/shops/all"
      );

      const result = await res.json();

      const rawShops = Array.isArray(result)
        ? result
        : result?.data ?? result?.shops ?? [];

      setShops(rawShops);
    } catch (e) {
      console.warn("Error fetching shops:", e);
    }
  };

  // Real-time GPS tracking setup
  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    (async () => {
      let { status } =
        await Location.requestForegroundPermissionsAsync();

      // Default location if GPS permission is not granted
      let lat = 20.048089972909867;
      let lng = 99.89494063617323;

      if (status === "granted") {
        // Get the user's current location
        let location = await Location.getCurrentPositionAsync({});

        lat = location.coords.latitude;
        lng = location.coords.longitude;

        // Watch the user's location in real time
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 3000,
            distanceInterval: 5,
          },
          (newLoc) => {
            const newCoords = {
              latitude: newLoc.coords.latitude,
              longitude: newLoc.coords.longitude,
            };

            setUserLocation(newCoords);
          }
        );
      }

      setUserLocation({
        latitude: lat,
        longitude: lng,
      });

      await fetchShops();
      setLoading(false);
    })();

    // Refresh the shop list every 5 seconds
    const intervalId = setInterval(() => {
      fetchShops();
    }, 5000);

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }

      clearInterval(intervalId);
    };
  }, []);

  // Show loading screen while location is being retrieved
  if (loading || !userLocation) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#17a2b8" />

        <Text style={{ marginTop: 10 }}>
          Calculating your live location...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Floating Back Header Bar */}
      <SafeAreaView style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#333"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Live Registered Shops Map
        </Text>
      </SafeAreaView>

      {/* Map View */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.002,
          longitudeDelta: 0.002,
        }}
        onMapReady={() => {
          // Automatically zoom in when the map is ready
          if (userLocation) {
            zoomToUserLocation(userLocation);
          }
        }}
        showsUserLocation={true}
      >
        {/* 2 km radius around the user's location */}
        <Circle
          center={userLocation}
          radius={2000}
          fillColor="rgba(23, 162, 184, 0.15)"
          strokeColor="#17a2b8"
          strokeWidth={2}
        />

        {/* Display all registered shops on the map */}
        {shops.map((shop) => {
          const shopLng =
            shop.address?.location?.coordinates?.[0] ??
            shop.longitude;

          const shopLat =
            shop.address?.location?.coordinates?.[1] ??
            shop.latitude;

          if (!shopLat || !shopLng) return null;

          return (
            <Marker
              key={shop._id || shop.id}
              coordinate={{
                latitude: Number(shopLat),
                longitude: Number(shopLng),
              }}
              title={shop.name}
              description="Registered Restaurant"
            >
              <View style={styles.markerContainer}>
                <Image
                  source={{
                    uri:
                      shop.shopImg ||
                      "https://cdn-icons-png.flaticon.com/512/3448/3448609.png",
                  }}
                  style={styles.shopIcon}
                  resizeMode="cover"
                />
              </View>
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },

  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    marginRight: 12,
    elevation: 3,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },

  map: {
    width: "100%",
    height: "100%",
  },

  markerContainer: {
    backgroundColor: "white",
    padding: 4,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#17a2b8",
    elevation: 4,
  },

  shopIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
});