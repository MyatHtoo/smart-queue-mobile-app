import { createNativeStackNavigator } from "@react-navigation/native-stack";
import JoinQueue from "../../app/screens/JoinQueue";
import QueueConfirm from "../../app/screens/QueueConfirm";
import { Text, TouchableOpacity, View } from "react-native";
import { Entypo, Ionicons } from "@expo/vector-icons";
import MyQueue from "../../app/screens/MyQueue";
import ViewLive from "../../app/screens/ViewLive";
import SearchScreen from "../../app/screens/Search";
import NotificationsScreen from "../../app/screens/Notifications";


const Stack = createNativeStackNavigator();

export default function StepStack() {
    return (
        <Stack.Navigator
            //   initialRouteName="GetStarted" 
            screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="Search"
                component={SearchScreen}
                options={({ navigation }) => ({
                    headerShown: true,
                    headerShadowVisible: false,
                    headerStyle: {
                        backgroundColor: "white",
                    },
                    headerTitle: "Search Results",
                    headerTitleStyle: {
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#111827'
                    },
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={{ marginRight: 26 }}>
                            <Entypo name="chevron-small-left" size={32}
                                color="#000" />
                        </TouchableOpacity>
                    ),
                })}
            />

            {/* <Stack.Screen name="GetStarted" component={GetStarted} />  */}
            <Stack.Screen name="JoinQueue" component={JoinQueue}
                options={{
                    headerShown: true,
                    headerTitle: "Join Queue",
                    headerShadowVisible: false,
                    headerStyle: {
                        backgroundColor: "white",
                    },
                    headerTintColor: "black",
                    headerTitleStyle: {
                        fontSize: 18,
                        fontWeight: "500",
                        color: "black"
                    },
                }} />
            <Stack.Screen
                name="QueueConfirm"
                component={QueueConfirm}
                options={({ navigation }) => ({
                    headerShown: true,
                    headerShadowVisible: false,
                    headerStyle: {
                        backgroundColor: "white",
                    },
                    headerTitle: "Queue Confirmed",
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={{ marginRight: 26 }}>
                            <Entypo name="chevron-small-left" size={32}
                                color="#000" />
                        </TouchableOpacity>
                    ),
                })}
            />
            <Stack.Screen
                name="MyQueue"
                component={MyQueue}
                options={({ navigation }) => ({
                    headerShown: true,
                    headerShadowVisible: false,
                    headerStyle: {
                        backgroundColor: "white",
                    },
                    headerTitle: "",
                    headerLeft: () => (
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
                })}
            />
            <Stack.Screen
                name="LiveQueue"
                component={ViewLive}
                options={({ navigation }) => ({
                    headerShown: true,
                    headerShadowVisible: false,
                    headerStyle: {
                        backgroundColor: "white",
                    },
                    headerTitle: "Live Queue",
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={{ marginRight: 26 }}>
                            <Entypo name="chevron-small-left" size={32}
                                color="#000" />
                        </TouchableOpacity>
                    ),
                })}
            />
            <Stack.Screen
                name="Notifications"
                component={NotificationsScreen}
                options={({ navigation }) => ({
                    headerShown: true,
                    headerShadowVisible: false,
                    headerStyle: {
                        backgroundColor: "white",
                        paddingBottom: 8,
                    },
                    headerTitle: "Notifications",
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={{ marginRight: 26 }}>
                            <Entypo name="chevron-small-left" size={32}
                                color="#000" />
                        </TouchableOpacity>
                    ),
                })}
            />


        </Stack.Navigator>
    );
}