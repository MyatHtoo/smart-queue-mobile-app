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
import { loginCustomer } from "../../src/services/api";

export default function LoginPage() {
  const navigation = useNavigation();
  const { userData, setUserData } = useUser();

  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginWithPhone, setLoginWithPhone] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [lastPayload, setLastPayload] = useState<any>(null);
  const [lastResponse, setLastResponse] = useState<any>(null);

  // shared login routine
  const doLogin = async (payload: any, isPhone: boolean) => {
    try {
      setErrorMessage("");
      let finalPayload = { ...payload };
      if (payload.usernameOrEmail || payload.email) {
        const v = (payload.usernameOrEmail ?? payload.email ?? "").trim();
        finalPayload = { email: v, password: payload.password };
      }

      setLastPayload(finalPayload);
      console.log("Login payload (sent):", finalPayload);

      const response: any = await loginCustomer(finalPayload);
      console.log("Login response:", response);
      setLastResponse(response);

      const token = response?.data?.accessToken ?? response?.data?.token ?? response?.accessToken ?? response?.token;
      const user = response?.data?.user ?? response?.data?.customer ?? (response?.data && typeof response.data !== 'object' ? undefined : response?.data) ?? response?.user ?? response;

      const respMessage = response?.message ?? response?.data?.message;
      if (respMessage && !token) {
        const rawMsg = Array.isArray(respMessage) ? respMessage.join(', ') : respMessage.toString();
        const formatMessage = (raw: string) => {
          let s = raw;
          if (!isPhone) {
            s = s.replace(/phone number|phone/gi, 'username/email');
          } else {
            s = s.replace(/username\/email|username|email/gi, 'phone number');
          }
          return s;
        };
        setErrorMessage(formatMessage(rawMsg));
        setLastResponse(response);
        return false;
      }

      if (!token || !user) {
        const message = isPhone
          ? "Incorrect phone number or password."
          : "Incorrect username/email or password.";
        setErrorMessage(message);
        setLastResponse(response);
        return false;
      }

      setUserData({
        name: user.username || user.name || (isPhone ? user.phoneNumber : user.email) || "",
        email: user.email || (isPhone ? "" : payload.email),
        phoneNumber: user.phoneNumber || (isPhone ? payload.phoneNumber : user.phoneNumber || ""),
        password: payload.password,
      });

      return true;
    } catch (error: any) {
      console.error("Login failed:", error);
      const rawErr = error?.message ?? (typeof error === 'string' ? error : JSON.stringify(error));
      const formatMessage = (raw: string) => {
        let s = raw;
        if (!isPhone) {
          s = s.replace(/phone number|phone/gi, 'username/email');
        } else {
          s = s.replace(/username\/email|username|email/gi, 'phone number');
        }
        return s;
      };
      setErrorMessage(formatMessage(rawErr) || "Login failed. Please try again.");
      setLastResponse(error);
      return false;
    }
  };

  const handleLoginWithEmail = async () => {
    const payload = { email: email?.trim(), password };
    const ok = await doLogin(payload, false);
    if (ok) (navigation.navigate as any)("MainTabs", { screen: "HomePage" });
  };

  const handleLoginWithPhone = async () => {
    const payload = { phoneNumber: phoneNumber?.trim(), password };
    const ok = await doLogin(payload, true);
    if (ok) (navigation.navigate as any)("MainTabs", { screen: "HomePage" });
  };

  const handleForgotPassword = () => {
    console.log("Forgot password");
  };

  const handleGoogleSignIn = () => {
    console.log("Google sign in");
    setUserData({
      name: "Google User",
      email: "user@gmail.com",
      phoneNumber: userData.phoneNumber || '',
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
                {/* Email or Phone Number Field */}
                <View>
                  <Text style={{ marginBottom: 8, fontSize: 14, fontWeight: "500", color: "#111827" }}>
                    {loginWithPhone ? "Phone Number" : "Email"}
                  </Text>
                  <TextInput
                    placeholder={loginWithPhone ? "Enter your phone number" : "Enter your email"}
                    value={loginWithPhone ? phoneNumber : email}
                    onChangeText={loginWithPhone ? setPhoneNumber : setEmail}
                    keyboardType={loginWithPhone ? "phone-pad" : "email-address"}
                    autoCapitalize={loginWithPhone ? "none" : "none"}
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

                {/* Toggle Login Mode */}
                <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 8 }}>
                  <View style={{ flex: 1, height: 1, backgroundColor: "#D1D5DB" }} />
                  <TouchableOpacity onPress={() => setLoginWithPhone(!loginWithPhone)}>
                    <Text style={{ marginHorizontal: 16, color: "#000000" }}>
                      {loginWithPhone ? "Login with Email" : "Login with Phone Number"}
                    </Text>
                  </TouchableOpacity>
                  <View style={{ flex: 1, height: 1, backgroundColor: "#D1D5DB" }} />
                </View>

                {errorMessage ? (
                  <Text style={{ color: "#DC2626", textAlign: "center", marginBottom: 8 }}>
                    {errorMessage}
                  </Text>
                ) : null}

                {/* Login Button */}
                <View style={{ marginTop: 16 }}>
                  <TouchableOpacity
                    onPress={loginWithPhone ? handleLoginWithPhone : handleLoginWithEmail}
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