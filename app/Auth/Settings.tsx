import { useEffect, useState } from "react";
import { Alert, ScrollView, Share, Switch, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MenuCard, MenuRow, ScreenHeader, SectionLabel } from "../../components/common/ScreenUI";
import { colors, radius } from "../../src/themes/design";

const NOTIFICATION_KEY = "smart-queue:notifications-enabled";
export default function Settings({ navigation }: any) {
  const [notifications, setNotifications] = useState(true);
  useEffect(() => { AsyncStorage.getItem(NOTIFICATION_KEY).then((value) => value != null && setNotifications(value === "true")); }, []);
  const toggleNotifications = async (value: boolean) => { setNotifications(value); await AsyncStorage.setItem(NOTIFICATION_KEY, String(value)); };
  const info = (title: string, message: string) => Alert.alert(title, message, [{ text: "Close" }]);
  return <View style={{ flex: 1, backgroundColor: colors.background }}><ScreenHeader title="Settings" subtitle="Control your Smart Queue experience" onBack={() => navigation.goBack()} />
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 36 }}>
      <SectionLabel>NOTIFICATIONS</SectionLabel><MenuCard><MenuRow icon="notifications-outline" title="Queue notifications" subtitle="Ready alerts, status changes and reminders" trailing={<Switch value={notifications} onValueChange={toggleNotifications} trackColor={{ false: colors.disabled, true: "#8FC4D3" }} thumbColor={notifications ? colors.primary : "#FFFFFF"} />} /></MenuCard>
      <View style={{ padding: 12, borderRadius: radius.medium, backgroundColor: notifications ? colors.primarySoft : "#F1F5F9", marginTop: 9 }}><Text style={{ color: colors.textMuted, fontSize: 11, lineHeight: 17 }}>{notifications ? "Notifications are enabled. Keep phone notifications allowed so you do not miss your turn." : "Notifications are disabled. You will need to check My Queue manually for updates."}</Text></View>
      <SectionLabel>PREFERENCES</SectionLabel><MenuCard><MenuRow icon="language-outline" title="Language" subtitle="Language used throughout the app" value="English" onPress={() => info("Language", "English is currently available. More languages can be added in a future release.")} /><MenuRow icon="share-social-outline" title="Share Smart Queue" subtitle="Invite someone to skip the physical line" onPress={() => Share.share({ message: "Try Smart Queue to discover nearby shops and manage queues from your phone." })} /><MenuRow icon="star-outline" title="Rate the app" subtitle="Tell us about your experience" onPress={() => navigation.navigate("Support", { tab: "contact" })} /></MenuCard>
      <SectionLabel>PRIVACY & LEGAL</SectionLabel><MenuCard><MenuRow icon="shield-checkmark-outline" title="Privacy policy" subtitle="How account and location data are used" onPress={() => info("Privacy policy", "Smart Queue uses your profile, location and queue activity only to provide nearby-shop and queue services. Location is requested while using the app and is not sold to third parties.")} /><MenuRow icon="document-text-outline" title="Terms of service" subtitle="Rules for using queue services" onPress={() => info("Terms of service", "Use accurate account information, join only when eligible, and follow each shop’s queue instructions. Queue availability and wait estimates may change in real time.")} /></MenuCard>
      <SectionLabel>ABOUT</SectionLabel><MenuCard><MenuRow icon="information-circle-outline" title="Smart Queue" subtitle="Customer mobile application" value="v1.0.0" /></MenuCard>
    </ScrollView>
  </View>;
}
