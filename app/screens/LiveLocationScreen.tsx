import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";

const LiveLocationScreen = () => {
  const [coords, setCoords] = useState<any>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCoords(location.coords);
    })();
  }, []);

  if (!coords) return null;

  const leafletHTML = `
  <!DOCTYPE html>
  <html>
  <head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body { margin:0; padding:0; }
    #map { height:100vh; }
  </style>
  </head>
  <body>
  <div id="map"></div>
  <script>
    var map = L.map('map').setView([${coords.latitude}, ${coords.longitude}], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    L.marker([${coords.latitude}, ${coords.longitude}])
      .addTo(map)
      .bindPopup("You are here")
      .openPopup();
      L.circle([${coords.latitude}, ${coords.longitude}], {
    
      radius: 2000,
  
      color: 'blue',
  
      fillOpacity: 0.2
    }).addTo(map);
  </script>
  </body>
  </html>
  `;

  return (
    <View style={styles.container}>
      <WebView originWhitelist={['*']} source={{ html: leafletHTML }} />
    </View>
  );
};

export default LiveLocationScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
});