import type { NavigatorScreenParams } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  distance: string;
  waitInfo: string;
  image: any;
}

export type ScreensStackParamList = {
  Search: undefined;
  JoinQueue: { restaurant: Restaurant };
  QueueConfirm: undefined;
  MyQueue: undefined;
  ViewLive: undefined;
  Notifications: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  Screens: NavigatorScreenParams<ScreensStackParamList>;
  Search: undefined;
  Notifications: undefined;
  AccountView: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Support: undefined;
};

export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;