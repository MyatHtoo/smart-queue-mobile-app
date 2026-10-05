import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { getShops } from "../../src/services/api";
import { distanceInMeters, MAX_QUEUE_DISTANCE_METERS } from "../../src/hooks/useNearbyShops";
import { cardShadow, colors, radius } from "../../src/themes/design";

type Coordinates = { latitude: number; longitude: number };
const shopItems = (response: any) => Array.isArray(response) ? response : response?.data ?? response?.shops ?? [];

export default function LiveLocationScreen({ embedded = false }: { embedded?: boolean }) {
  const navigation = useNavigation(); const mapRef = useRef<WebView>(null);
  const [location, setLocation] = useState<Coordinates | null>(null); const [shops, setShops] = useState<any[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);
  const load = useCallback(async (requestPermission = false) => {
    setLoading(true); setError("");
    try {
      const permission = requestPermission
        ? await Location.requestForegroundPermissionsAsync()
        : await Location.getForegroundPermissionsAsync();
      setPermissionStatus(permission.status);
      if (permission.status !== "granted") throw new Error("Location permission is required to show nearby shops.");
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const coords = { latitude: current.coords.latitude, longitude: current.coords.longitude }; setLocation(coords); setShops(shopItems(await getShops()));
    } catch (reason: any) { setError(reason?.message || "Unable to load the live map."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(false); }, [load]);
  const mapped = shops.map((shop) => { const coordinates = shop?.address?.location?.coordinates; const longitude = Number(coordinates?.[0] ?? shop?.longitude); const latitude = Number(coordinates?.[1] ?? shop?.latitude); const valid = Number.isFinite(latitude) && Number.isFinite(longitude); const distance = location && valid ? distanceInMeters(location.latitude, location.longitude, latitude, longitude) : undefined; return { ...shop, latitude, longitude, valid, distance, nearby: distance != null && distance <= MAX_QUEUE_DISTANCE_METERS, imageUrl: shop?.shopImg ?? shop?.logo ?? shop?.image?.uri ?? "" }; }).filter((shop) => shop.valid);
  const nearbyCount = mapped.filter((shop) => shop.nearby).length;
  const mapHtml = useMemo(() => {
    if (!location) return "";
    const markers = mapped.map((shop) => ({
      latitude: shop.latitude,
      longitude: shop.longitude,
      name: String(shop.name ?? "Shop"),
      nearby: shop.nearby,
      distance: shop.distance == null ? "" : shop.distance < 1000 ? `${Math.round(shop.distance)} m away` : `${(shop.distance / 1000).toFixed(1)} km away`,
      imageUrl: shop.imageUrl,
    }));
    return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"><style>html,body,#map{height:100%;margin:0;background:#eef4f6}.leaflet-control-attribution{font:9px sans-serif}.shop-label{font:700 12px sans-serif;color:#102033}.user-dot{width:14px;height:14px;border:3px solid white;border-radius:50%;background:#4285f4;box-shadow:0 0 0 2px #4285f4}</style></head><body><div id="map"></div><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><script>
      const center=[${location.latitude},${location.longitude}];
      const map=L.map('map',{zoomControl:false,attributionControl:true}).setView(center,14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap'}).addTo(map);
      L.circle(center,{radius:${MAX_QUEUE_DISTANCE_METERS},color:'#1E7A9B',weight:2,fillColor:'#1E7A9B',fillOpacity:.12}).addTo(map);
      L.marker(center,{icon:L.divIcon({className:'',html:'<div class="user-dot"></div>',iconSize:[20,20],iconAnchor:[10,10]})}).addTo(map).bindPopup('<b>Your location</b>');
      ${JSON.stringify(markers)}.forEach(s=>{const image=s.imageUrl?'<img src="'+s.imageUrl+'" style="width:40px;height:40px;border-radius:50%;object-fit:cover;border:3px solid white;box-shadow:0 2px 6px #0004" onerror="this.style.display=\\'none\\'">':'<div style="width:40px;height:40px;border-radius:50%;background:'+(s.nearby?'#1E7A9B':'#9AA7B4')+';border:3px solid white;box-shadow:0 2px 6px #0004"></div>';L.marker([s.latitude,s.longitude],{icon:L.divIcon({className:'',html:image,iconSize:[46,46],iconAnchor:[23,23]})}).addTo(map).bindPopup('<div class="shop-label">'+s.name+'</div><div>'+s.distance+' · '+(s.nearby?'Queue available':'Outside 1 km')+'</div>')});
      window.focusUser=()=>map.setView(center,14,{animate:true});
    </script></body></html>`;
  }, [location, mapped]);

  if (loading && !location) return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}><ActivityIndicator size="large" color={colors.primary} /><Text style={{ color: colors.text, fontWeight: "800", marginTop: 14 }}>Preparing your map</Text><Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 5 }}>Checking location access securely…</Text></View>;
  if (!location) return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: colors.background }}><View style={{ width: 78, height: 78, borderRadius: 39, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" }}><Ionicons name={permissionStatus === "denied" ? "location-outline" : "navigate"} size={36} color={colors.primary} /></View><Text style={{ color: colors.text, fontSize: 21, fontWeight: "900", marginTop: 18, textAlign: "center" }}>{permissionStatus === "denied" ? "Location access is off" : "See shops around you"}</Text><Text style={{ color: colors.textMuted, textAlign: "center", lineHeight: 21, marginTop: 8 }}>{permissionStatus === "denied" ? "Allow location access in Settings to see nearby shops and queue availability." : "Smart Queue uses your location to show registered shops within the 1 km queue service area."}</Text><TouchableOpacity onPress={() => load(true)} style={{ height: 50, paddingHorizontal: 28, borderRadius: radius.pill, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", marginTop: 22 }}><Text style={{ color: "#FFFFFF", fontWeight: "900" }}>{permissionStatus === "denied" ? "Try location again" : "Allow location"}</Text></TouchableOpacity>{error ? <Text style={{ color: colors.danger, textAlign: "center", fontSize: 12, marginTop: 12 }}>{error}</Text> : null}{!embedded && <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 14 }}><Text style={{ color: colors.textMuted, fontWeight: "700" }}>Go back</Text></TouchableOpacity>}</View>;

  return <View style={{ flex: 1 }}><WebView ref={mapRef} style={{ flex: 1, backgroundColor: colors.background }} source={{ html: mapHtml }} originWhitelist={["*"]} javaScriptEnabled domStorageEnabled mixedContentMode="always" startInLoadingState renderLoading={() => <View style={{ position: "absolute", inset: 0, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}><ActivityIndicator size="large" color={colors.primary} /></View>} />
    <View style={{ position: "absolute", top: 48, left: 16, right: 16, flexDirection: "row", alignItems: "center" }}>{!embedded && <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 44, height: 44, borderRadius: 15, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", ...cardShadow }}><Ionicons name="arrow-back" size={21} color={colors.primary} /></TouchableOpacity>}<View style={{ flex: 1, marginLeft: embedded ? 0 : 9, paddingHorizontal: 14, height: 52, borderRadius: 16, backgroundColor: colors.surface, justifyContent: "center", ...cardShadow }}><Text style={{ color: colors.text, fontWeight: "900" }}>Live shop map</Text><Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 2 }}>{nearbyCount} within 1 km • {mapped.length} registered</Text></View></View>
    <View style={{ position: "absolute", right: 16, bottom: 135, gap: 9 }}><TouchableOpacity onPress={() => load(false)} style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", ...cardShadow }}>{loading ? <ActivityIndicator color={colors.primary} /> : <Ionicons name="refresh" size={21} color={colors.primary} />}</TouchableOpacity><TouchableOpacity onPress={() => mapRef.current?.injectJavaScript("window.focusUser && window.focusUser(); true;")} style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", ...cardShadow }}><Ionicons name="locate" size={21} color="#FFFFFF" /></TouchableOpacity></View>
    <View style={{ position: "absolute", left: 16, right: 16, bottom: 24, padding: 15, borderRadius: radius.large, backgroundColor: colors.surface, flexDirection: "row", alignItems: "center", ...cardShadow }}><View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" }}><Ionicons name="navigate" size={21} color={colors.primary} /></View><View style={{ flex: 1, marginLeft: 11 }}><Text style={{ color: colors.text, fontWeight: "900" }}>1 km queue service area</Text><Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 3 }}>Colored markers can accept your queue.</Text></View></View>
  </View>;
}
