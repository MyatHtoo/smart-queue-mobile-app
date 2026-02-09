import { View, Text, StyleSheet, Alert } from "react-native";
import { Provider as PaperProvider, IconButton, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';

export default function QR() {
  const navigation = useNavigation();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) {
    return (
      <PaperProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: "white", justifyContent: 'center', alignItems: 'center' }}>
          <Text>Requesting camera permission...</Text>
        </SafeAreaView>
      </PaperProvider>
    );
  }

  if (!permission.granted) {
    return (
      <PaperProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: "white", justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
          <Text style={{ textAlign: 'center', fontSize: 16, color: '#374151', marginBottom: 16 }}>
            Camera permission is required to scan QR codes.
          </Text>
          <Button
            mode="contained"
            onPress={requestPermission}
            style={{ backgroundColor: '#17a2b8', borderRadius: 20 }}
            labelStyle={{ fontSize: 14, paddingVertical: 4 }}
          >
            Grant Permission
          </Button>
        </SafeAreaView>
      </PaperProvider>
    );
  }

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    Alert.alert('QR Code Scanned', `Data: ${data}`);
  };
  return (
    <PaperProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        {/* Header */}
        <View className="bg-white border-b border-gray-200">
          <View 
            style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              paddingVertical: 8,
              minHeight: 56
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827' }}>
              Scan QR Code
            </Text>
            <View style={{ width: 40 }} />
          </View>
        </View>

        {/* Content */}
        <View style={{ flex: 1 }}>
          {/* Camera View */}
          <View style={styles.cameraContainer}>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ["qr"],
              }}
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            />
            
            {/* Scanner Frame Overlay */}
            <View style={styles.overlay}>
              <View style={styles.scannerFrame}>
                {/* Corner borders */}
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
            </View>
          </View>

          {/* Instructions */}
          <View style={{ padding: 24, backgroundColor: 'white' }}>
            <Text style={{ 
              fontSize: 16, 
              color: '#374151', 
              textAlign: 'center',
              lineHeight: 24,
              marginBottom: 16
            }}>
              {scanned ? "QR Code scanned successfully!" : "Position the QR code within the frame to scan"}
            </Text>

            {scanned && (
              <Button
                mode="contained"
                onPress={() => setScanned(false)}
                style={{ 
                  backgroundColor: '#17a2b8',
                  borderRadius: 20,
                  marginBottom: 8
                }}
                labelStyle={{ fontSize: 14, paddingVertical: 4 }}
              >
                Scan Again
              </Button>
            )}

            
          </View>
        </View>
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#17a2b8',
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
});