import { NavigationContainer } from "@react-navigation/native";
import { PaperProvider } from "react-native-paper";
import { Theme } from "./src/themes/Theme";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomTabs from "./src/navigation/BottomTabs";
import StepStack from "./src/navigation/StepStack";
import SearchScreen from "./app/screens/Search";
import NotificationsScreen from "./app/screens/Notifications";
import LoginPage from "./app/Auth/LoginPage";
import RegisterPage from "./app/Auth/RegisterPage";
import AccountView from "./app/Auth/AccountView";
import EditProfile from "./app/Auth/EditProfile";
import Settings from "./app/Auth/Settings";
import Support from "./app/Auth/Support";
import { UserProvider } from "./src/contexts/UserContext";

export default function App() {
  const Stack = createNativeStackNavigator();
  return (
    <UserProvider>
      <PaperProvider theme={Theme}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginPage} />
            <Stack.Screen name="Register" component={RegisterPage} />
            <Stack.Screen name="MainTabs" component={BottomTabs} />
            <Stack.Screen name="Screens" component={StepStack} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen 
              name="AccountView" 
              component={AccountView}
              options={{
                animation: 'slide_from_left',
              }}
            />
            <Stack.Screen name="EditProfile" component={EditProfile} />
            <Stack.Screen name="Settings" component={Settings} />
            <Stack.Screen name="Support" component={Support} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </UserProvider>
  );
}
