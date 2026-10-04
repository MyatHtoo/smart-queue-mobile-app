import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MenuCard, MenuRow, ScreenHeader, SectionLabel } from "../../components/common/ScreenUI";
import { useUser } from "../../src/contexts/UserContext";
import { colors, radius } from "../../src/themes/design";
import { useNotifications } from "../../src/contexts/NotificationContext";

export default function AccountView({ navigation }: any) {
  const { userData, setUserData, clearToken, token } = useUser();
  const { unreadCount } = useNotifications();
  const isSignedIn = Boolean(token);
  const logout = () => Alert.alert("Sign out?", "You will need to sign in again to manage your queues.", [{ text: "Stay signed in", style: "cancel" }, { text: "Sign out", style: "destructive", onPress: async () => { await clearToken(); setUserData({ name: "", email: "", phoneNumber: "", profileImage: "", password: "", token: "", id: "" }); } }]);
  const contact = isSignedIn ? userData.email || userData.phoneNumber || "No contact information" : "Sign in to manage your queues";

  return <View style={{ flex: 1, backgroundColor: colors.background }}>
    <ScreenHeader title="Account" subtitle="Profile and app preferences" onBack={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate("MainTabs", { screen: "HomePage" })} />
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 34 }} showsVerticalScrollIndicator={false}>
      <View style={{ padding: 18, borderRadius: radius.large, backgroundColor: colors.primary, flexDirection: "row", alignItems: "center" }}>
        {userData.profileImage ? <Image source={{ uri: userData.profileImage }} style={{ width: 72, height: 72, borderRadius: 22, borderWidth: 2, borderColor: "rgba(255,255,255,0.5)" }} /> : <View style={{ width: 72, height: 72, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.16)", alignItems: "center", justifyContent: "center" }}><Ionicons name="person" size={34} color="#FFFFFF" /></View>}
        <View style={{ flex: 1, marginLeft: 14 }}><Text style={{ color: "#FFFFFF", fontSize: 21, fontWeight: "900" }} numberOfLines={1}>{isSignedIn ? userData.name || "Smart Queue user" : "Welcome"}</Text><Text style={{ color: "#DDF0F5", fontSize: 12, marginTop: 4 }} numberOfLines={1}>{contact}</Text><View style={{ alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.16)", borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 5, marginTop: 9 }}><Text style={{ color: "#FFFFFF", fontSize: 10, fontWeight: "800" }}>{isSignedIn ? "CUSTOMER ACCOUNT" : "GUEST"}</Text></View></View>
        {isSignedIn && <TouchableOpacity onPress={() => navigation.navigate("EditProfile")} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.17)", alignItems: "center", justifyContent: "center" }}><Ionicons name="pencil" size={18} color="#FFFFFF" /></TouchableOpacity>}
      </View>

      {isSignedIn && <><SectionLabel>ACCOUNT</SectionLabel><MenuCard><MenuRow icon="person-outline" title="Edit profile" subtitle="Update your name, contact details and photo" onPress={() => navigation.navigate("EditProfile")} /><MenuRow icon="time-outline" title="Queue history" subtitle="Review completed and cancelled queues" onPress={() => navigation.navigate("MainTabs", { screen: "MyQueues", params: { initialSection: "history" } })} /></MenuCard></>}
      <SectionLabel>DISCOVER</SectionLabel><MenuCard><MenuRow icon="map-outline" title="Live shop map" subtitle="See registered shops around your current location" onPress={() => navigation.navigate("LiveLocation")} /><MenuRow icon="notifications-outline" title="Notifications" subtitle="Queue updates and important alerts" value={unreadCount ? `${unreadCount > 9 ? "9+" : unreadCount} new` : undefined} onPress={() => navigation.navigate("Screens", { screen: "Notifications" })} /></MenuCard>
      <SectionLabel>APP</SectionLabel><MenuCard><MenuRow icon="settings-outline" title="Settings" subtitle="Notifications, language and privacy" onPress={() => navigation.navigate("Settings")} /><MenuRow icon="help-circle-outline" title="Help & support" subtitle="FAQs and ways to contact support" onPress={() => navigation.navigate("Support")} /></MenuCard>
      <View style={{ marginTop: 20 }}><MenuCard>{isSignedIn ? <MenuRow icon="log-out-outline" title="Sign out" subtitle="Securely end this session" danger onPress={logout} /> : <MenuRow icon="log-in-outline" title="Sign in" subtitle="Access your queues, history and notifications" onPress={() => navigation.navigate("Login")} />}</MenuCard></View>
      <Text style={{ textAlign: "center", color: colors.textMuted, fontSize: 10, marginTop: 22 }}>Smart Queue mobile • Customer app</Text>
    </ScrollView>
  </View>;
}
