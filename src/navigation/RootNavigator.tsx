import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "../components/LoadingScreen";
import LoginScreen from "../screens/LoginScreen";
import MainTabs from "./MainTabs";

export default function RootNavigator() {
  const { user, initializing } = useAuth();

  if (initializing) return <LoadingScreen />;

  return (
    <NavigationContainer>
      {user ? <MainTabs /> : <LoginScreen />}
    </NavigationContainer>
  );
}
