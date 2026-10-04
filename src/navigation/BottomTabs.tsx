import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Entypo, Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { IconButton } from "react-native-paper";
import HomePage from '../../app/screens/HomePage';
import MyQueue from '../../app/screens/MyQueue';
import QR from '../../app/screens/QR';
import LiveLocationScreen from '../../app/screens/LiveLocationScreen';
import { colors } from '../themes/design';
import { useNotifications } from '../contexts/NotificationContext';


const Tab = createBottomTabNavigator();
const LiveLocationTab = () => <LiveLocationScreen embedded />;

export default function BottomTabs() {
    const navigation = useNavigation();
    const { unreadCount } = useNotifications();
    return (
        <Tab.Navigator
            initialRouteName="HomePage"
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarHideOnKeyboard: true,
                tabBarStyle: { height: 72, paddingTop: 7, paddingBottom: 8, borderTopColor: colors.border, backgroundColor: '#FFFFFF' }
            }}>

            <Tab.Screen
                name="HomePage"
                component={HomePage}
                options={{
                    tabBarIcon: ({ focused, color, size }) => (
                        <Entypo name="home" size={focused ? size + 2 : size} color={color} />
                    ),
                    tabBarLabel: ({ focused, color }) => (
                        <Text
                            style={{
                                color,
                                fontSize: focused ? 13 : 12,
                                fontWeight: focused ? "600" : "400",
                            }}>
                            Home
                        </Text>
                    ),
                    headerShown: true,
                    header: ({ navigation }) => (
                        <View style={{ paddingTop: 28, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: colors.border }}>
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
                                <IconButton
                                    icon="menu"
                                    size={24}
                                    onPress={() => navigation.navigate("AccountView" as never)}
                                    iconColor={colors.text}
                                    style={{ margin: 0, padding: 0 }}
                                />
                                <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>
                                    Smart Queue
                                </Text>
                                <TouchableOpacity onPress={() => navigation.navigate("Screens", { screen: "Notifications" })} activeOpacity={0.75} style={{ width: 42, height: 42, alignItems: 'center', justifyContent: 'center' }}>
                                    <Ionicons name={unreadCount ? "notifications" : "notifications-outline"} size={24} color={colors.text} />
                                    {unreadCount > 0 && <View style={{ position: 'absolute', right: 1, top: 1, minWidth: 19, height: 19, paddingHorizontal: 4, borderRadius: 10, backgroundColor: colors.danger, borderWidth: 2, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#FFFFFF', fontSize: 9, fontWeight: '900' }}>{unreadCount > 9 ? '9+' : unreadCount}</Text></View>}
                                </TouchableOpacity>
                            </View>
                        </View>
                    ),
                }} />

            <Tab.Screen
                name="LiveMap"
                component={LiveLocationTab}
                options={{
                    tabBarIcon: ({ focused, color, size }) => <Ionicons name={focused ? "map" : "map-outline"} size={focused ? size + 2 : size} color={color} />,
                    tabBarLabel: ({ focused, color }) => <Text style={{ color, fontSize: focused ? 13 : 12, fontWeight: focused ? "600" : "400" }}>Map</Text>,
                }}
            />

            <Tab.Screen
                name="QRScan"
                component={QR}
                options={{
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons name="scan" size={focused ? size + 2 : size} color={color} />
                    ),
                    tabBarLabel: ({ focused, color }) => (
                        <Text
                            style={{
                                color,
                                fontSize: focused ? 13 : 12,
                                fontWeight: focused ? "600" : "400",
                            }}>
                            Scan
                        </Text>
                    ),
                    headerShown: true,
                    header: ({ navigation }) => (
                        <View style={{ paddingTop: 28, backgroundColor: 'white' }}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingHorizontal: 12,
                                    paddingVertical: 8,
                                    minHeight: 56
                                }}>
                                <Entypo name="chevron-small-left" size={32}
                                    onPress={() => navigation.goBack()}
                                    color="#000"
                                    style={{ marginRight: 18, padding: 0 }} />

                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827' }}>
                                   Scan
                                </Text>
                            </View>
                        </View>
                    ),
                }} />

            <Tab.Screen
                name="MyQueues"
                component={MyQueue}
                options={{
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons name="time" size={focused ? size + 2 : size} color={color} />
                    ),
                    tabBarLabel: ({ focused, color }) => (
                        <Text
                            style={{
                                color,
                                fontSize: focused ? 13 : 12,
                                fontWeight: focused ? "600" : "400",
                            }}>
                            My Queue
                        </Text>
                    ),
                    headerShown: true,
                    header: ({ navigation }) => (
                        <View style={{ paddingTop: 28, backgroundColor: 'white' }}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingHorizontal: 12,
                                    paddingVertical: 8,
                                    minHeight: 56
                                }}>
                                <Entypo name="chevron-small-left" size={32}
                                    onPress={() => navigation.navigate("HomePage" as never)}
                                    color="#000"
                                    style={{ marginRight: 18, padding: 0 }} />

                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827' }}>
                                    My Queues
                                </Text>
                            </View>
                        </View>
                    ),
                }} />



        </Tab.Navigator>
    );
}
