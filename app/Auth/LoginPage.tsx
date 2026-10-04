import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { AuthField, AuthShell, PrimaryAuthButton } from "../../components/auth/AuthUI";
import { useUser } from "../../src/contexts/UserContext";
import { loginCustomer, setAuthToken } from "../../src/services/api";
import { isValidEmail, isValidPhone, normalizeEmail, normalizePhone } from "../../src/utils/AuthValidation";
import { getProfileImageForAccount, saveProfileImageForAccount } from "../../src/utils/ProfileImageStore";
import { colors, radius } from "../../src/themes/design";

const tokenFrom = (response: any) => response?.data?.accessToken ?? response?.data?.token ?? response?.accessToken ?? response?.token;
const userFrom = (response: any) => response?.data?.user ?? response?.data?.customer ?? response?.user ?? response?.customer ?? response?.data;
const idFrom = (user: any) => String(user?._id ?? user?.id ?? user?.userId ?? user?.customerId ?? user?.customer_id ?? "");

export default function LoginPage() {
  const navigation = useNavigation();
  const { setUserData, setToken } = useUser();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  const login = async () => {
    const isEmail = identifier.includes("@");
    const normalized = isEmail ? normalizeEmail(identifier) : normalizePhone(identifier);
    const nextErrors: typeof errors = {};
    if (!normalized) nextErrors.identifier = "Email or phone number is required.";
    else if (isEmail && !isValidEmail(normalized)) nextErrors.identifier = "Enter a valid email address.";
    else if (!isEmail && !isValidPhone(normalized)) nextErrors.identifier = "Enter a valid email or an 8–15 digit phone number.";
    if (!password) nextErrors.password = "Password is required.";
    if (Object.keys(nextErrors).length) return setErrors(nextErrors);

    setLoading(true); setErrors({});
    try {
      const response: any = await loginCustomer(isEmail ? { email: normalized, password } : { phoneNumber: normalized, password });
      const token = tokenFrom(response);
      const user = userFrom(response);
      if (!token || !user) throw new Error("The login response was incomplete. Please try again.");
      const id = idFrom(user);
      const email = user?.email ?? (isEmail ? normalized : "");
      const phoneNumber = user?.phoneNumber ?? (!isEmail ? normalized : "");
      const apiImage = user?.profileImage ?? user?.profile_image ?? user?.avatar ?? user?.avatarUrl ?? "";
      const profileImage = apiImage || await getProfileImageForAccount({ id, email, phoneNumber });
      setAuthToken(token);
      setUserData({ id, name: user?.username || user?.name || email || phoneNumber, email, phoneNumber, profileImage, password: "", token });
      if (apiImage) await saveProfileImageForAccount({ id, email, phoneNumber }, apiImage);
      await setToken(token);
    } catch (error: any) { setErrors({ form: error?.message || "Incorrect email, phone number, or password." }); }
    finally { setLoading(false); }
  };

  return <AuthShell title="Welcome back" subtitle="Sign in to manage your queues and check in at shops.">
    <AuthField label="Email or phone number" value={identifier} onChangeText={(value) => { setIdentifier(value); setErrors((current) => ({ ...current, identifier: undefined, form: undefined })); }} placeholder="name@example.com or +66…" icon="person-circle-outline" keyboardType="default" autoComplete="username" error={errors.identifier} returnKeyType="next" />
    <AuthField label="Password" value={password} onChangeText={(value) => { setPassword(value); setErrors((current) => ({ ...current, password: undefined, form: undefined })); }} placeholder="Enter your password" icon="lock-closed-outline" secure showSecure={showPassword} onToggleSecure={() => setShowPassword((value) => !value)} autoComplete="current-password" error={errors.password} returnKeyType="done" />
    {!!errors.form && <View style={{ flexDirection: "row", padding: 12, backgroundColor: "#FEF2F2", borderRadius: radius.medium, marginBottom: 15 }}><Ionicons name="alert-circle" size={18} color={colors.danger} /><Text style={{ flex: 1, color: colors.danger, fontSize: 12, lineHeight: 18, marginLeft: 7 }}>{errors.form}</Text></View>}
    <PrimaryAuthButton label="Sign in" loading={loading} onPress={login} />
    <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 24 }}><Text style={{ color: colors.textMuted }}>New to Smart Queue? </Text><TouchableOpacity disabled={loading} onPress={() => (navigation.navigate as any)("Register")}><Text style={{ color: colors.primary, fontWeight: "900" }}>Create account</Text></TouchableOpacity></View>
    <View style={{ flexDirection: "row", padding: 12, borderRadius: radius.medium, backgroundColor: colors.primarySoft, marginTop: 24 }}><Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} /><Text style={{ flex: 1, color: colors.textMuted, fontSize: 11, lineHeight: 17, marginLeft: 7 }}>Your credentials are sent securely to the Smart Queue API. We never display or store your password in this app.</Text></View>
  </AuthShell>;
}
