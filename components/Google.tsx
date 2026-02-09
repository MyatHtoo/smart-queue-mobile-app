import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface GoogleSignInButtonProps {
  onPress?: () => void;
}

export default function GoogleSignInButton({ onPress }: GoogleSignInButtonProps) {
  const handleGoogleSignIn = () => {
    if (onPress) {
      onPress();
    } else {
      console.log("Google Sign In pressed");
    }
  };

  return (
    <TouchableOpacity
      onPress={handleGoogleSignIn}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#D1D5DB",
        height: 56,
        borderRadius: 12,
        gap: 12,
      }}
    >
      <Ionicons name="logo-google" size={24} color="#DB4437" />
      <Text style={{ fontSize: 16, fontWeight: "500", color: "#111827" }}>
        Continue with Google
      </Text>
    </TouchableOpacity>
  );
}