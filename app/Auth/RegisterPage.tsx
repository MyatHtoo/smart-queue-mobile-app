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

export default function RegisterPage() {
  const navigation = useNavigation();
  const { setUserData } = useUser();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phonenumber, setPhonenumber] = useState("");

  const handleCreateAccount = async () => {
    console.log("Create account with:", username, email, phonenumber, password);
    setUserData({
      username: username,
      email: "",
      phonenumber: phonenumber,
      password: password,
    });
    (navigation.navigate as any)("MainTabs", { screen: "HomePage" });
  };

  const handleGoogleSignIn = () => {
    console.log("Google sign in");
    setUserData({
      username: "Google User",
      email: "googleuser@gmail.com",
      password: "",
    });
    (navigation.navigate as any)("MainTabs", { screen: "HomePage" });
  };

  const handleNavigateToLogin = () => {
    (navigation.navigate as any)("Login");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
          <SafeAreaView style={{ flex: 1, marginTop: 2 }}>
            <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 48 }}>
              {/* Header */}
              <View style={{ marginBottom: 40 }}>
                <Text style={{ fontSize: 36, fontWeight: "bold", textAlign: "center", color: "#111827" }}>
                  Create Account
                </Text>
                <Text style={{ marginTop: 8, fontSize: 16, textAlign: "center", color: "#17a2b8" }}>
                  Let's start with creating an account!
                </Text>
              </View>

              {/* Form */}
              <View style={{ gap: 20 }}>
                {/* Username Field */}
                <View>
                  <Text style={{ marginBottom: 8, fontSize: 14, fontWeight: "500", color: "#111827" }}>
                    Username
                  </Text>
                  <TextInput
                    placeholder="Enter your username"
                    value={username}
                    onChangeText={setUsername}
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

                {/* Email Field
                <View>
                  <Text style={{ marginBottom: 8, fontSize: 14, fontWeight: "500", color: "#111827" }}>
                    Email
                  </Text>
                  <TextInput
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={{
                      backgroundColor: "#F5F5F5",
                      borderRadius: 12,
                      borderColor: "#E5E7EB",
                      borderWidth: 1,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      fontSize: 16,
                      color: "#111827",
                    }}
                    placeholderTextColor="#9CA3AF"
                  />
                </View> */}

                {/* Phone Number Field */}
                <View>
                  <Text
                    style={{
                      marginBottom: 8,
                      fontSize: 14,
                      fontWeight: "500",
                      color: "#111827",
                    }}
                  >
                    Phone Number
                  </Text>

                  <TextInput
                    placeholder="Enter your phone number"
                    value={phonenumber}
                    onChangeText={setPhonenumber}
                    keyboardType="phone-pad"
                    maxLength={15}
                    style={{
                      backgroundColor: "#F5F5F5",
                      borderRadius: 12,
                      borderColor: "#E5E7EB",
                      borderWidth: 1,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      fontSize: 16,
                      color: "#111827",
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

                {/* Create Account Button */}
                <View style={{ marginTop: 16 }}>
                  <TouchableOpacity
                    onPress={handleCreateAccount}
                    style={{
                      backgroundColor: "#17a2b8",
                      borderRadius: 12,
                      paddingVertical: 16,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 16, fontWeight: "600", color: "#FFFFFF" }}>
                      Create Account
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


                {/* Login Link */}
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 16, marginBottom: 24 }}>
                  <Text style={{ fontSize: 16, color: "#17a2b8" }}>
                    Already have an account?{" "}
                  </Text>
                  <TouchableOpacity onPress={handleNavigateToLogin}>
                    <Text style={{ fontSize: 16, fontWeight: "600", color: "#111827" }}>
                      Login
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
