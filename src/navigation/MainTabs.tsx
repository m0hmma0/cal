import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import BookingScreen from "../screens/BookingScreen";
import MySessionsScreen from "../screens/MySessionsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { colors } from "../theme/theme";

export type MainTabParamList = {
  Book: undefined;
  MySessions: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICONS: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
  Book: "calendar",
  MySessions: "time",
  Profile: "person",
};

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name as keyof MainTabParamList]} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen name="Book" component={BookingScreen} options={{ title: "Book" }} />
      <Tab.Screen
        name="MySessions"
        component={MySessionsScreen}
        options={{ title: "My Sessions" }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
    </Tab.Navigator>
  );
}
