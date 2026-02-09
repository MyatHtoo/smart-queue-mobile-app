import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FacebookSignInButtonProps {
  onPress?: () => void;
}

export default function FacebookSignInButton({ onPress }: FacebookSignInButtonProps) {
  const handleFacebookSignIn = () => {
    if (onPress) {
      onPress();
    } else {
      console.log("Facebook Sign In pressed");
    }
  };

  return (
    <TouchableOpacity
      onPress={handleFacebookSignIn}
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
      <Ionicons name="logo-facebook" size={24} color="#1877F2" />
      <Text style={{ fontSize: 16, fontWeight: "500", color: "#111827" }}>
        Continue with Facebook
      </Text>
    </TouchableOpacity>
  );
}