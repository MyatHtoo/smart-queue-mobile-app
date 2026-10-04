import { ActivityIndicator, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useCallback, useRef, useState } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { getCustomerQueues, scanQueueQr } from "../../src/services/api";
import { useUser } from "../../src/contexts/UserContext";
import { getQueueStatus, isFinishedQueueStatus } from "../../src/utils/LiveQueue";
import { parseQueueQr, queueIdFrom, queueQrFrom } from "../../src/utils/QueueQr";
import { cardShadow, colors, radius } from "../../src/themes/design";

type ScanState = "idle" | "verifying" | "success" | "error";
const itemsFrom = (response: any): any[] => {
  const data = response?.data ?? response;
  return Array.isArray(data) ? data : Array.isArray(data?.queues) ? data.queues : Array.isArray(data?.data) ? data.data : [];
};
const isActive = (queue: any) => {
  const status = getQueueStatus(queue);
  return !isFinishedQueueStatus(status) && !["cancelled", "canceled", "completed", "expired", "served"].includes(status);
};

function MessageCard({ state, message, onRetry, onQueues }: { state: ScanState; message: string; onRetry: () => void; onQueues: () => void }) {
  if (state === "idle") return <View style={styles.tip}><Ionicons name="information-circle" size={19} color={colors.primary} /><Text style={styles.tipText}>Use the QR displayed at the shop counter. Your queue will be checked automatically.</Text></View>;
  const success = state === "success";
  return <View style={[styles.resultCard, { borderColor: success ? "#BBF7D0" : state === "error" ? "#FECACA" : colors.border }]}>
    <View style={[styles.resultIcon, { backgroundColor: success ? colors.successSoft : state === "error" ? "#FEF2F2" : colors.primarySoft }]}>{state === "verifying" ? <ActivityIndicator color={colors.primary} /> : <Ionicons name={success ? "checkmark-circle" : "alert-circle"} size={28} color={success ? colors.success : colors.danger} />}</View>
    <Text style={styles.resultTitle}>{state === "verifying" ? "Verifying queue" : success ? "Check-in successful" : "Could not verify QR"}</Text><Text style={styles.resultMessage}>{message}</Text>
    {state !== "verifying" && <View style={{ flexDirection: "row", gap: 9, marginTop: 14 }}><TouchableOpacity onPress={onRetry} style={styles.secondaryButton}><Text style={{ color: colors.primary, fontWeight: "800" }}>Scan again</Text></TouchableOpacity>{success && <TouchableOpacity onPress={onQueues} style={styles.primaryButton}><Text style={{ color: "#FFFFFF", fontWeight: "800" }}>My queue</Text></TouchableOpacity>}</View>}
  </View>;
}

export default function QR() {
  const navigation = useNavigation();
  const { userData } = useUser();
  const [permission, requestPermission] = useCameraPermissions();
  const [state, setState] = useState<ScanState>("idle");
  const [message, setMessage] = useState("");
  const [torch, setTorch] = useState(false);
  const [activeQueues, setActiveQueues] = useState<any[]>([]);
  const [loadingQueues, setLoadingQueues] = useState(true);
  const lock = useRef(false);

  const loadQueues = useCallback(async () => {
    if (!userData.id) { setActiveQueues([]); setLoadingQueues(false); return; }
    setLoadingQueues(true);
    try { setActiveQueues(itemsFrom(await getCustomerQueues(userData.id)).filter(isActive)); }
    catch { setActiveQueues([]); }
    finally { setLoadingQueues(false); }
  }, [userData.id]);
  useFocusEffect(useCallback(() => { lock.current = false; setState("idle"); setMessage(""); loadQueues(); }, [loadQueues]));
  const reset = () => { lock.current = false; setState("idle"); setMessage(""); };

  const scan = async ({ data }: { data: string }) => {
    if (lock.current || state !== "idle") return;
    lock.current = true; setState("verifying"); setMessage("Checking this code against your active queue…");
    try {
      const parsed = parseQueueQr(data);
      if (!parsed.queueQr) throw new Error("This QR code does not contain queue information.");
      let queueId = parsed.queueId && /^[a-f\d]{24}$/i.test(parsed.queueId) ? parsed.queueId : undefined;
      if (!queueId) {
        const matching = activeQueues.find((queue) => queueQrFrom(queue) === parsed.queueQr) ?? (activeQueues.length === 1 ? activeQueues[0] : undefined);
        const resolved = queueIdFrom(matching);
        if (/^[a-f\d]{24}$/i.test(resolved)) queueId = resolved;
      }
      if (!queueId && userData.id) {
        const fresh = itemsFrom(await getCustomerQueues(userData.id)).filter(isActive);
        setActiveQueues(fresh);
        const matching = fresh.find((queue) => queueQrFrom(queue) === parsed.queueQr) ?? (fresh.length === 1 ? fresh[0] : undefined);
        const resolved = queueIdFrom(matching);
        if (/^[a-f\d]{24}$/i.test(resolved)) queueId = resolved;
      }
      if (!queueId) throw new Error("Join an active queue before scanning this shop QR code.");
      const response: any = await scanQueueQr({ queueId, queueQr: parsed.queueQr });
      const result = response?.data ?? response;
      if (!queueIdFrom(result)) throw new Error("The server could not confirm this queue.");
      setState("success"); setMessage(`Queue ${queueQrFrom(result) || parsed.queueQr} is verified. You are checked in.`); loadQueues();
    } catch (error: any) { setState("error"); setMessage(error?.message || "Check that this is the correct shop QR code and try again."); }
  };

  if (!permission) return <View style={styles.centerState}><ActivityIndicator size="large" color={colors.primary} /><Text style={styles.stateTitle}>Preparing camera</Text><Text style={styles.stateText}>Please wait a moment…</Text></View>;
  if (!permission.granted) return <View style={styles.centerState}><View style={styles.permissionIcon}><Ionicons name="camera-outline" size={38} color={colors.primary} /></View><Text style={styles.stateTitle}>Camera access needed</Text><Text style={styles.stateText}>Smart Queue uses your camera only to scan the shop’s check-in QR code.</Text><TouchableOpacity onPress={requestPermission} style={[styles.primaryButton, { width: "100%", marginTop: 20 }]}><Text style={{ color: "#FFFFFF", fontWeight: "900" }}>Allow camera access</Text></TouchableOpacity>{permission.canAskAgain === false && <TouchableOpacity onPress={Linking.openSettings} style={{ padding: 15 }}><Text style={{ color: colors.primary, fontWeight: "800" }}>Open phone settings</Text></TouchableOpacity>}</View>;

  const queue = activeQueues[0];
  const shop = queue?.shop_id ?? queue?.shopId ?? queue?.shop ?? {};
  const queueNumber = queue?.queue_number ?? queue?.queueNumber ?? queue?.number ?? queue?.queueNo;
  return <View style={{ flex: 1, backgroundColor: colors.background }}>
    <View style={styles.queueStrip}>{loadingQueues ? <ActivityIndicator color={colors.primary} /> : activeQueues.length ? <><View style={styles.queueIcon}><Ionicons name="ticket" size={20} color={colors.primary} /></View><View style={{ flex: 1, marginLeft: 10 }}><Text style={{ color: colors.text, fontWeight: "800" }} numberOfLines={1}>{shop?.name || queue?.shopName || "Active queue"}</Text><Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>Queue {queueNumber || "—"} • Ready to scan</Text></View><View style={styles.readyBadge}><Text style={{ color: colors.success, fontSize: 11, fontWeight: "800" }}>ACTIVE</Text></View></> : <><Ionicons name="alert-circle-outline" size={21} color={colors.warning} /><Text style={{ flex: 1, color: colors.textMuted, fontSize: 12, lineHeight: 17, marginLeft: 8 }}>No active queue found. Join a nearby shop before scanning.</Text></>}</View>
    <View style={styles.cameraCard}>
      <CameraView style={StyleSheet.absoluteFill} facing="back" enableTorch={torch} barcodeScannerSettings={{ barcodeTypes: ["qr"] }} onBarcodeScanned={state === "idle" && activeQueues.length > 0 ? scan : undefined} />
      <View style={styles.overlay}><View style={styles.scanFrame}><View style={[styles.corner, styles.topLeft]} /><View style={[styles.corner, styles.topRight]} /><View style={[styles.corner, styles.bottomLeft]} /><View style={[styles.corner, styles.bottomRight]} /><View style={styles.scanLine} /></View><Text style={styles.cameraText}>{state === "idle" ? "Align the QR code inside the frame" : state === "verifying" ? "Hold still while we verify" : "Scan paused"}</Text></View>
      <TouchableOpacity onPress={() => setTorch((value) => !value)} style={[styles.torch, torch && { backgroundColor: colors.primary }]}><Ionicons name={torch ? "flash" : "flash-off"} size={21} color="#FFFFFF" /></TouchableOpacity>
    </View>
    <View style={{ padding: 16 }}><MessageCard state={state} message={message} onRetry={reset} onQueues={() => (navigation.navigate as any)("MyQueues")} /></View>
  </View>;
}

const styles = StyleSheet.create({
  centerState: { flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", paddingHorizontal: 28 },
  permissionIcon: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center", marginBottom: 18 },
  stateTitle: { color: colors.text, fontSize: 20, fontWeight: "900", marginTop: 16 }, stateText: { color: colors.textMuted, fontSize: 14, lineHeight: 21, textAlign: "center", marginTop: 8 },
  queueStrip: { minHeight: 70, margin: 16, marginBottom: 12, borderRadius: radius.medium, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 13, flexDirection: "row", alignItems: "center", ...cardShadow },
  queueIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" }, readyBadge: { backgroundColor: colors.successSoft, paddingHorizontal: 9, paddingVertical: 6, borderRadius: radius.pill },
  cameraCard: { flex: 1, minHeight: 360, marginHorizontal: 16, borderRadius: radius.large, overflow: "hidden", backgroundColor: "#0F172A" }, overlay: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(2,6,23,0.48)" },
  scanFrame: { width: 230, height: 230 }, corner: { position: "absolute", width: 38, height: 38, borderColor: "#FFFFFF" }, topLeft: { left: 0, top: 0, borderLeftWidth: 5, borderTopWidth: 5, borderTopLeftRadius: 12 }, topRight: { right: 0, top: 0, borderRightWidth: 5, borderTopWidth: 5, borderTopRightRadius: 12 }, bottomLeft: { left: 0, bottom: 0, borderLeftWidth: 5, borderBottomWidth: 5, borderBottomLeftRadius: 12 }, bottomRight: { right: 0, bottom: 0, borderRightWidth: 5, borderBottomWidth: 5, borderBottomRightRadius: 12 },
  scanLine: { position: "absolute", left: 16, right: 16, top: "50%", height: 2, backgroundColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 1, shadowRadius: 8, elevation: 5 }, cameraText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700", marginTop: 28 }, torch: { position: "absolute", right: 14, top: 14, width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(15,23,42,0.72)", alignItems: "center", justifyContent: "center" },
  tip: { flexDirection: "row", padding: 13, borderRadius: radius.medium, backgroundColor: colors.primarySoft }, tipText: { flex: 1, color: colors.textMuted, fontSize: 12, lineHeight: 18, marginLeft: 8 },
  resultCard: { padding: 14, borderRadius: radius.medium, backgroundColor: colors.surface, borderWidth: 1, alignItems: "center", ...cardShadow }, resultIcon: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" }, resultTitle: { color: colors.text, fontSize: 16, fontWeight: "900", marginTop: 8 }, resultMessage: { color: colors.textMuted, fontSize: 12, lineHeight: 18, textAlign: "center", marginTop: 5 },
  primaryButton: { flex: 1, minHeight: 44, borderRadius: radius.pill, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", paddingHorizontal: 18 }, secondaryButton: { flex: 1, minHeight: 44, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.primary, alignItems: "center", justifyContent: "center", paddingHorizontal: 18 },
});
