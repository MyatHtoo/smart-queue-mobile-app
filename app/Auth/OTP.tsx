import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "../../src/contexts/UserContext";

type Props = {
  navigation: any;
  route: any;
};

export default function OTPScreen({ navigation, route }: Props) {
  const { setUserData } = useUser();
  const { type, value, username, email, phonenumber, password } = route.params;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (text: string, index: number) => {
    // Only allow digits
    const digit = text.replace(/[^0-9]/g, "");
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
    }
  };

  const handleVerify = () => {
    const code = otp.join("");
    if (code.length < 6) {
      Alert.alert("Error", "Please enter the complete 6-digit code.");
      return;
    }

    // Verification complete — create account
    const successLabel = type === "email" ? "Email" : "Phone number";
    Alert.alert("Success!", `${successLabel} verified. Account created!`, [
      {
        text: "OK",
        onPress: () => {
          setUserData({
            username,
            email,
            phonenumber,
            password,
          });
          navigation.navigate("MainTabs", { screen: "HomePage" });
        },
      },
    ]);
  };

  const handleResend = () => {
    setTimer(60);
    setCanResend(false);
    setOtp(["", "", "", "", "", ""]);
    Alert.alert(
      "Code Resent",
      `A new verification code has been sent to your ${type === "email" ? "email" : "phone number"}.`
    );
  };

  const maskedValue =
    type === "email"
      ? value.replace(/(.{2})(.*)(@)/, "$1***$3")
      : value.replace(/(\d{3})\d+(\d{2})/, "$1****$2");

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          {/* Back button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons
                name={type === "email" ? "mail-outline" : "call-outline"}
                size={32}
                color="#17a2b8"
              />
            </View>
            <Text style={styles.title}>Verify Your {type === "email" ? "Email" : "Phone Number"}</Text>
            <Text style={styles.subtitle}>
              We've sent a 6-digit verification code to
            </Text>
            <Text style={styles.valueText}>{maskedValue}</Text>
          </View>

          {/* OTP Input */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputRefs.current[index] = ref; }}
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                style={[
                  styles.otpInput,
                  digit ? styles.otpInputFilled : null,
                ]}
                selectionColor="#17a2b8"
              />
            ))}
          </View>

          {/* Timer & Resend */}
          <View style={styles.resendContainer}>
            {canResend ? (
              <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendText}>Resend Code</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.timerText}>
                Resend code in{" "}
                <Text style={{ fontWeight: "600", color: "#17a2b8" }}>
                  {timer}s
                </Text>
              </Text>
            )}
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            onPress={handleVerify}
            style={[
              styles.verifyButton,
              otp.join("").length < 6 && styles.verifyButtonDisabled,
            ]}
          >
            <Text style={styles.verifyButtonText}>
              Verify & Create Account
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  stepContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#D1D5DB",
  },
  stepDotActive: {
    backgroundColor: "#17a2b8",
  },
  stepLine: {
    width: 60,
    height: 3,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: "#17a2b8",
  },
  stepLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  header: {
    alignItems: "center",
    marginBottom: 36,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E0F7FA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
  },
  valueText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginTop: 4,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 24,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  otpInputFilled: {
    borderColor: "#17a2b8",
    backgroundColor: "#F0FDFA",
  },
  resendContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  timerText: {
    fontSize: 14,
    color: "#6B7280",
  },
  resendText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#17a2b8",
  },
  verifyButton: {
    backgroundColor: "#17a2b8",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
