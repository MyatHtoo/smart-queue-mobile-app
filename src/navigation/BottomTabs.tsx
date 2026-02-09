import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Entypo, Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { IconButton } from "react-native-paper";
import HomePage from '../../app/screens/HomePage';
import MyQueue from '../../app/screens/MyQueue';
import QR from '../../app/screens/QR';


const Tab = createBottomTabNavigator();

function EmptyScreen() {
    return null;
}

export default function BottomTabs() {
    const navigation = useNavigation();
    return (
        <Tab.Navigator
            initialRouteName="HomePage"
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#2563EB",
                tabBarInactiveTintColor: "#9CA3AF",
                tabBarStyle: { height: 70 }
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
                        <View style={{ paddingTop: 28, backgroundColor: 'white' }}>
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
                                    iconColor="#000"
                                    style={{ margin: 0, padding: 0 }}
                                />
                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827' }}>
                                    Smart Queue
                                </Text>
                                <IconButton
                                    icon="bell-outline"
                                    size={24}
                                    onPress={() => navigation.navigate("Screens", { screen: "Notifications" })}
                                    iconColor="#000"
                                    style={{ margin: 0, padding: 0 }}
                                />
                            </View>
                        </View>
                    ),
                }} />

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
                            QR Scan
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