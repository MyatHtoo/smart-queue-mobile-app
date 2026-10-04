import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { AuthField, AuthShell, PrimaryAuthButton } from "../../components/auth/AuthUI";
import { sendEmailOtp } from "../../src/services/api";
import { isValidEmail, normalizeEmail, passwordError } from "../../src/utils/AuthValidation";
import { colors, radius } from "../../src/themes/design";

type Errors = { name?: string; email?: string; password?: string; terms?: string };

export default function RegisterPage() {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const cleanName = name.trim(); const cleanEmail = normalizeEmail(email);
    const next: Errors = {};
    if (cleanName.length < 2) next.name = "Enter your full name.";
    if (!isValidEmail(cleanEmail)) next.email = "Enter a valid email address.";
    const passwordMessage = passwordError(password); if (passwordMessage) next.password = passwordMessage;
    if (!accepted) next.terms = "Please confirm before creating your account.";
    if (Object.keys(next).length) return setErrors(next);

    setLoading(true); setErrors({});
    try {
      await sendEmailOtp({ email: cleanEmail });
      (navigation.navigate as any)("OTP", { flow: "register", type: "email", value: cleanEmail, name: cleanName, email: cleanEmail, password });
    } catch (error: any) { Alert.alert("Could not send verification code", error?.message || "Check your connection and try again."); }
    finally { setLoading(false); }
  };

  const clear = (field: keyof Errors) => setErrors((current) => ({ ...current, [field]: undefined }));
  return <AuthShell title="Create account" subtitle="Register with your email and verify it securely.">
    <AuthField label="Full name" value={name} onChangeText={(value) => { setName(value); clear("name"); }} placeholder="Your name" icon="person-outline" autoComplete="name" error={errors.name} returnKeyType="next" />
    <AuthField label="Email address" value={email} onChangeText={(value) => { setEmail(value); clear("email"); }} placeholder="name@example.com" icon="mail-outline" keyboardType="email-address" autoComplete="email" error={errors.email} returnKeyType="next" />
    <AuthField label="Password" value={password} onChangeText={(value) => { setPassword(value); clear("password"); }} placeholder="At least 8 characters" icon="lock-closed-outline" secure showSecure={showPassword} onToggleSecure={() => setShowPassword((value) => !value)} autoComplete="new-password" error={errors.password} returnKeyType="done" />
    <TouchableOpacity onPress={() => { setAccepted((value) => !value); clear("terms"); }} activeOpacity={0.8} style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: errors.terms ? 5 : 20 }}><View style={{ width: 22, height: 22, borderRadius: 7, borderWidth: 1.5, borderColor: accepted ? colors.primary : colors.border, backgroundColor: accepted ? colors.primary : colors.surface, alignItems: "center", justifyContent: "center", marginTop: 1 }}>{accepted && <Ionicons name="checkmark" size={15} color="#FFFFFF" />}</View><Text style={{ flex: 1, color: colors.textMuted, fontSize: 12, lineHeight: 18, marginLeft: 9 }}>I confirm that these details are correct and agree to use them for Smart Queue notifications and account access.</Text></TouchableOpacity>
    {!!errors.terms && <Text style={{ color: colors.danger, fontSize: 11, marginBottom: 14 }}>{errors.terms}</Text>}
    <View style={{ padding: 11, borderRadius: radius.medium, backgroundColor: colors.primarySoft, flexDirection: "row", marginBottom: 16 }}><Ionicons name="mail-outline" size={18} color={colors.primary} /><Text style={{ flex: 1, color: colors.textMuted, fontSize: 11, lineHeight: 17, marginLeft: 7 }}>A 6-digit verification code will be sent to this email address.</Text></View>
    <PrimaryAuthButton label="Continue to verification" loading={loading} onPress={submit} />
    <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 22 }}><Text style={{ color: colors.textMuted }}>Already have an account? </Text><TouchableOpacity disabled={loading} onPress={() => (navigation.navigate as any)("Login")}><Text style={{ color: colors.primary, fontWeight: "900" }}>Sign in</Text></TouchableOpacity></View>
  </AuthShell>;
}
