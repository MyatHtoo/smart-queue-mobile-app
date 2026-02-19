import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import GoogleSignInButton from "../../components/Google";
import { useUser } from "../../src/contexts/UserContext";

export default function LoginPage() {
  const navigation = useNavigation();
  const { setUserData } = useUser();

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    console.log("Login with:", usernameOrEmail, password);
    setUserData({
      username: usernameOrEmail,
      email: usernameOrEmail,
      password: password,
    });
    (navigation.navigate as any)("MainTabs", { screen: "HomePage" });
  };

  const handleForgotPassword = () => {
    console.log("Forgot password");
  };

  const handleGoogleSignIn = () => {
    console.log("Google sign in");
    setUserData({
      username: "Google User",
      email: "user@gmail.com",
      password: "",
    });
    (navigation.navigate as any)("MainTabs", { screen: "HomePage" });
  };

  const handleFacebookSignIn = () => {
    console.log("Facebook sign in");
    setUserData({
      username: "Facebook User",
      email: "user@facebook.com",
      password: "",
    });
    (navigation.navigate as any)("MainTabs", { screen: "HomePage" });
  };

  const handleCreateAccount = () => {
    (navigation.navigate as any)("Register");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
          <SafeAreaView style={{ flex: 1, marginTop: 40 }}>
            <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 48 }}>
              {/* Header */}
              <View style={{ marginBottom: 40 }}>
                <Text style={{ fontSize: 36, fontWeight: "bold", textAlign: "center", color: "#111827" }}>
                  Login Account
                </Text>
                <Text style={{ marginTop: 8, fontSize: 16, textAlign: "center", color: "#17a2b8" }}>
                  Let's start with login to your account!
                </Text>
              </View>

              {/* Form */}
              <View style={{ gap: 20 }}>
                {/* Username or Email Field */}
                <View>
                  <Text style={{ marginBottom: 8, fontSize: 14, fontWeight: "500", color: "#111827" }}>
                    Username or Email
                  </Text>
                  <TextInput
                    placeholder="Enter your username or email"
                    value={usernameOrEmail}
                    onChangeText={setUsernameOrEmail}
                    style={{
                      backgroundColor: "#F5F5F5",
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      fontSize: 16,
                      color: "#111827",
                      borderColor: "#E5E7EB",
                      borderWidth: 1,
                    }}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                {/* Password Field */}
                <View>
                  <Text style={{ marginBottom: 8, fontSize: 14, fontWeight: "500", color: "#111827" }}>
                    Password
                  </Text>
                  <View style={{ position: "relative" }}>
                    <TextInput
                      placeholder="At least 8 characters"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      style={{
                        backgroundColor: "#F5F5F5",
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        fontSize: 16,
                        color: "#111827",
                        borderColor: "#E5E7EB",
                        borderWidth: 1,
                      }}
                      placeholderTextColor="#9CA3AF"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: 16,
                        top: "50%",
                        transform: [{ translateY: -12 }],
                      }}
                    >
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={24}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Forgot Password Link */}
                <TouchableOpacity onPress={handleForgotPassword} style={{ alignSelf: "flex-start" }}>
                  <Text style={{ fontSize: 14, color: "#17a2b8" }}>
                    Forget your password?{" "}
                    <Text style={{ fontWeight: "600", color: "#111827" }}>Click me</Text>
                  </Text>
                </TouchableOpacity>

                {/* Login Button */}
                <View style={{ marginTop: 16 }}>
                  <TouchableOpacity
                    onPress={handleLogin}
                    style={{
                      backgroundColor: "#17a2b8",
                      borderRadius: 12,
                      paddingVertical: 16,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 16, fontWeight: "600", color: "#FFFFFF" }}>
                      Login
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Divider */}
                <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 8 }}>
                  <View style={{ flex: 1, height: 1, backgroundColor: "#D1D5DB" }} />
                  <Text style={{ marginHorizontal: 16, color: "#6B7280" }}>Or</Text>
                  <View style={{ flex: 1, height: 1, backgroundColor: "#D1D5DB" }} />
                </View>

                {/* Social Sign In Buttons */}
                <GoogleSignInButton onPress={handleGoogleSignIn} />

                {/* Create Account Link */}
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 16, marginBottom: 24 }}>
                  <Text style={{ fontSize: 16, color: "#17a2b8" }}>
                    Not have an account yet?{" "}
                  </Text>
                  <TouchableOpacity onPress={handleCreateAccount}>
                    <Text style={{ fontSize: 16, fontWeight: "600", color: "#111827" }}>
                      Create Account
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}