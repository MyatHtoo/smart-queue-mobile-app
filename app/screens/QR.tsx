import { View, Text, StyleSheet, Alert } from "react-native";
import { Provider as PaperProvider, IconButton, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { getCustomerQueues, scanQueueQr } from "../../src/services/api";
import { useUser } from "../../src/contexts/UserContext";
import { getQueueStatus, isFinishedQueueStatus } from "../../src/utils/LiveQueue";

type QueueQrData = {
  queueId?: string;
  queueQr: string;
};

const getQueueDataFromQr = (data: string): QueueQrData => {
  const scannedValue = data.trim();
  const fallback: QueueQrData = { queueQr: scannedValue };

  try {
    const decodedValue = decodeURIComponent(scannedValue);
    const value = JSON.parse(decodedValue);
    const payload = value?.data ?? value?.result ?? value;
    const queueObject = payload?.queue ?? payload?.queueData ?? payload;
    const queueId = String(
      payload?.queue_id ?? payload?.queueId ?? payload?._id ?? payload?.id ??
      queueObject?.queue_id ?? queueObject?.queueId ?? queueObject?._id ?? queueObject?.id ?? ""
    ).trim();
    const queueQr = String(
      payload?.queue_qr ?? payload?.queueQr ?? queueObject?.queue_qr ?? queueObject?.queueQr ?? ""
    ).trim();

    return {
      queueId: queueId || undefined,
      queueQr: queueQr || fallback.queueQr,
    };
  } catch {
    try {
      const url = new URL(scannedValue);
      const queueId = url.searchParams.get("queue_id") || url.searchParams.get("queueId");
      const queueQr = url.searchParams.get("queue_qr") || url.searchParams.get("queueQr");
      return {
        queueId: queueId?.trim() || undefined,
        queueQr: queueQr?.trim() || fallback.queueQr,
      };
    } catch {
      return fallback;
    }
  }
};

export default function QR() {
  const navigation = useNavigation();
  const { userData } = useUser();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || submitting) return;

    setScanned(true);
    setSubmitting(true);

    try {
      const scannedValue = data.trim();
      const { queueId, queueQr } = getQueueDataFromQr(scannedValue);
      console.log("[QR] Raw scan:", scannedValue);
      console.log("[QR] Queue ID sent to API:", queueId ?? "(not included)");
      console.log("[QR] Queue QR sent to API:", queueQr);

      if (!queueQr) {
        throw new Error("The scanned QR code does not contain a queue QR value.");
      }

      // Some QR codes contain only the queue_qr value (for example uuid-23410).
      // The backend can resolve those without requiring a Mongo queue_id.
      let validQueueId = queueId && /^[a-f\d]{24}$/i.test(queueId) ? queueId : undefined;
      if (queueId && !validQueueId) {
        console.warn("[QR] Ignoring malformed queue ID and verifying by queue QR only:", queueId);
      }

      // The backend requires queue_id even when the scanned QR contains only
      // queue_qr. Resolve the UUID from this customer's queues first.
      if (!validQueueId && userData.id) {
        const customerResponse: any = await getCustomerQueues(userData.id);
        const queues = Array.isArray(customerResponse)
          ? customerResponse
          : customerResponse?.data ?? customerResponse?.queues ?? customerResponse?.data?.queues ?? [];
        const matchedQueue = (Array.isArray(queues) ? queues : []).find((queue: any) => {
          const qr = queue?.queue_qr ?? queue?.queueQr ?? queue?.qr_code ?? queue?.qrCode;
          const status = getQueueStatus(queue);
          const active = !isFinishedQueueStatus(status) && !['cancelled', 'canceled', 'completed', 'expired', 'served'].includes(status);
          return active && String(qr ?? '').trim() === queueQr;
        });
        const resolvedId = matchedQueue?.queue_id ?? matchedQueue?.queueId ?? matchedQueue?._id ?? matchedQueue?.id;
        if (resolvedId && /^[a-f\d]{24}$/i.test(String(resolvedId))) {
          validQueueId = String(resolvedId);
          console.log('[QR] Resolved queue ID from customer queues:', validQueueId);
        }
      }

      if (!validQueueId) {
        throw new Error('This QR code is not associated with one of your active queues. Join the queue first, then scan again.');
      }

      const response = await scanQueueQr({ queueId: validQueueId, queueQr });
      console.log("[QR] generate-qr response:", JSON.stringify(response));
      const result = (response as any)?.data ?? response;
      const verifiedQueueId = result?.queue_id ?? result?.queueId ?? result?.id;
      const verifiedQueueQr = result?.queue_qr ?? result?.queueQr ?? queueQr;
      console.log("Scanned QR code result:", result);

      if (!verifiedQueueId) {
        throw new Error("The scanned QR code did not return a queue ID.");
      }

      Alert.alert(
        "QR Code Scanned",
        `Queue verified: ${verifiedQueueQr}`,
        [{
          text: "View My Queue",
          onPress: () => (navigation.navigate as any)("MyQueues"),
        }]
      );
    } catch (error: any) {
      console.error("[QR] Scan request failed:", error?.message ?? error);
      Alert.alert(
        "Unable to scan QR code",
        error?.message || "Please make sure this is a valid queue QR code and try again.",
        [{ text: "Scan Again", onPress: () => setScanned(false) }]
      );
    } finally {
      setSubmitting(false);
    }
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
              style={StyleSheet.absoluteFill}
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
              {submitting
                ? "Verifying your queue..."
                : scanned
                  ? "QR Code scanned successfully!"
                  : "Position the QR code within the frame to scan"}
            </Text>

            {scanned && (
              <Button
                mode="contained"
                onPress={() => setScanned(false)}
                disabled={submitting}
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
    ...StyleSheet.absoluteFill,
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
