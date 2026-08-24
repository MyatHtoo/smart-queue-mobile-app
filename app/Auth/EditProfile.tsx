import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { TextInput, Button, Text, IconButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '../../src/contexts/UserContext';
import {
  changeEmail,
  changePassword,
  changePhoneNumber,
  changeProfileImage,
  changeUsername,
  sendEmailOtp,
  sendPhoneOtp,
  setAuthToken,
} from '../../src/services/api';
import { saveProfileImageForAccount } from '../../src/utils/ProfileImageStore';

type Props = {
  navigation: any;
  route: any;
};

const getUserIdFromToken = (jwtToken?: string | null): string => {
  if (!jwtToken) return '';
  try {
    const parts = jwtToken.split('.');
    if (parts.length < 2) return '';
    const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payloadBase64.padEnd(payloadBase64.length + ((4 - (payloadBase64.length % 4)) % 4), '=');
    const json = atob(padded);
    const payload = JSON.parse(json);
    return (
      payload?.sub ||
      payload?.userId ||
      payload?.userID ||
      payload?.id ||
      payload?._id ||
      payload?.customerId ||
      payload?.customer_id ||
      ''
    );
  } catch {
    return '';
  }
};

const EditProfileScreen = ({ navigation, route }: Props) => {
  const { userData, setUserData, token } = useUser();
  const [username, setUsername] = useState(userData.name || '');
  const [email, setEmail] = useState(userData.email || '');
  const [phoneNumber, setPhoneNumber] = useState(userData.phoneNumber || '');
  const [profileImageUri, setProfileImageUri] = useState(userData.profileImage || '');
  const [profileImageChanged, setProfileImageChanged] = useState(false);
  const [password, setPassword] = useState(userData.password || '');
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [verifiedPhoneOtp, setVerifiedPhoneOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [isOldEmailVerified, setIsOldEmailVerified] = useState(false);
  const [isNewEmailVerified, setIsNewEmailVerified] = useState(false);
  const [verifiedOldEmailOtp, setVerifiedOldEmailOtp] = useState('');
  const [verifiedNewEmailOtp, setVerifiedNewEmailOtp] = useState('');
  const lastOtpResultAtRef = useRef<number>(0);
  const newEmailOtpSentRef = useRef<string>('');

  const resetPhoneVerificationState = () => {
    setIsPhoneVerified(false);
    setVerifiedPhoneOtp('');
  };

  const resetEmailVerificationState = () => {
    setIsOldEmailVerified(false);
    setIsNewEmailVerified(false);
    setVerifiedOldEmailOtp('');
    setVerifiedNewEmailOtp('');
    newEmailOtpSentRef.current = '';
  };

  useEffect(() => {
    setUsername(userData.name || '');
    setEmail(userData.email || '');
    setPhoneNumber(userData.phoneNumber || ''); 
    setProfileImageUri(userData.profileImage || '');
    setProfileImageChanged(false);
    setPassword(userData.password || '');
    resetPhoneVerificationState();
    resetEmailVerificationState();
  }, [userData]);

  useEffect(() => {
    const params = route?.params;

    if (params?.emailOldVerified) {
      setIsOldEmailVerified(true);
    }
    if (params?.emailNewVerified) {
      setIsNewEmailVerified(true);
    }
    if (params?.oldEmailVerifiedOtp) {
      setVerifiedOldEmailOtp(String(params.oldEmailVerifiedOtp));
    }
    if (params?.newEmailVerifiedOtp) {
      setVerifiedNewEmailOtp(String(params.newEmailVerifiedOtp));
    }
    if (params?.pendingNewEmail) {
      setEmail(String(params.pendingNewEmail));
    }

    if (!params?.otpVerified) {
      return;
    }

    const otpResultAt = Number(params?.otpResultAt || 0);
    if (otpResultAt && otpResultAt <= lastOtpResultAtRef.current) {
      return;
    }
    if (otpResultAt) {
      lastOtpResultAtRef.current = otpResultAt;
    }

    if (params?.verificationType === 'phone') {
      const verifiedPhone = String(params?.verificationTarget || '').trim();
      const verifiedOtp = String(params?.verifiedOtp || '').trim();
      if (verifiedPhone) {
        // Keep local input aligned with the verified target in case screen state was reset.
        setPhoneNumber(verifiedPhone);
        setIsPhoneVerified(true);
        setVerifiedPhoneOtp(verifiedOtp);

        const hasRealPhoneChange = verifiedPhone !== normalizedCurrentPhone;
        if (hasRealPhoneChange && verifiedOtp) {
          applyPhoneChangeAfterOtp(verifiedPhone, verifiedOtp);
        }
      }
    } else if (params?.verificationType === 'email') {
      if (params?.pendingNewEmail) {
        setEmail(String(params.pendingNewEmail));
      }
      const verifiedOtp = String(params?.verifiedOtp || '');
      if (!params?.verificationStep || params?.verificationStep === 'new') {
        setIsNewEmailVerified(true);
        setVerifiedNewEmailOtp(verifiedOtp);
        navigation.setParams({
          emailNewVerified: true,
          newEmailVerifiedOtp: verifiedOtp,
        });
      }
    }

    navigation.setParams({
      otpVerified: undefined,
      verificationType: undefined,
      verificationTarget: undefined,
      verificationStep: undefined,
      verifiedOtp: undefined,
      pendingNewEmail: params?.pendingNewEmail,
      otpResultAt: undefined,
    });
  }, [route?.params, navigation, token, userData, email, phoneNumber, verifiedOldEmailOtp]);

  const handlePhoneNumberChange = (value: string) => {
    setPhoneNumber(value);
    resetPhoneVerificationState();
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    resetEmailVerificationState();
    navigation.setParams({
      emailOldVerified: undefined,
      emailNewVerified: undefined,
      oldEmailVerifiedOtp: undefined,
      newEmailVerifiedOtp: undefined,
      pendingNewEmail: undefined,
    });
  };

  const normalizedCurrentPhone = (userData.phoneNumber || '').trim();
  const normalizedNewPhone = (phoneNumber || '').trim();
  const phoneChanged = normalizedNewPhone !== normalizedCurrentPhone;
  const usernameChanged = !!(username && username !== userData.name);
  const passwordChanged = !!(password && password !== userData.password);
  const normalizedCurrentEmail = (userData.email || '').trim().toLowerCase();
  const normalizedNewEmail = (email || '').trim().toLowerCase();
  const emailChanged = !!(userData.email && normalizedNewEmail && normalizedNewEmail !== normalizedCurrentEmail);
  const isOtpRequiredError = (msg: string) =>
    /phone\s*number.*not\s*verified.*otp/i.test(msg) ||
    (msg.toLowerCase().includes('otp') && msg.toLowerCase().includes('not verified'));

  const getErrorMessage = (error: any, fallback = '') =>
    String(error?.message || error?.response?.data?.message || error || fallback);

  const isApiSuccess = (resp: any) => {
    const success = resp?.data?.success ?? resp?.success ?? false;
    const message = resp?.data?.message ?? resp?.message ?? '';
    return {
      success: success || /success/i.test(String(message)),
      message,
    };
  };

  const extractProfileImageUrl = (resp: any): string => {
    return (
      resp?.data?.customer?.profileImage ||
      resp?.data?.user?.profileImage ||
      resp?.data?.profileImage ||
      resp?.customer?.profileImage ||
      resp?.user?.profileImage ||
      resp?.profileImage ||
      ''
    );
  };

  const handlePickProfileImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Please allow photo library access to upload a profile image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const pickedUri = result.assets[0].uri;
      if (pickedUri) {
        setProfileImageUri(pickedUri);
        setProfileImageChanged(true);
      }
    } catch (error: any) {
      Alert.alert('Error', getErrorMessage(error, 'Failed to pick image.'));
    }
  };

  const applyPhoneChangeAfterOtp = async (newPhone: string, otp: string) => {
    const activeToken = token || userData.token || null;
    const resolvedUserId = userData.id || getUserIdFromToken(activeToken);
    const phonePayload: any = {
      phoneNumber: newPhone,
      newPhoneNumber: newPhone,
      currentPhoneNumber: normalizedCurrentPhone,
      otp,
    };

    if (resolvedUserId) {
      phonePayload.id = resolvedUserId;
      phonePayload.customerId = resolvedUserId;
      phonePayload.customer_id = resolvedUserId;
      phonePayload.userId = resolvedUserId;
      phonePayload.userID = resolvedUserId;
      phonePayload._id = resolvedUserId;
    }

    try {
      if (activeToken) setAuthToken(activeToken);
      const response: any = await changePhoneNumber(phonePayload);
      console.log('Change phone response:', response);
      const { success, message } = isApiSuccess(response);
      if (!success) {
        Alert.alert('Error', message || 'Failed to update phone number');
        return;
      }

      setUserData({
        ...userData,
        phoneNumber: newPhone,
        token: userData.token || token || '',
        id: resolvedUserId || userData.id || '',
      });
      Alert.alert('Success', 'Phone number updated successfully.', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('AccountView', { phoneNumber: newPhone }),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', getErrorMessage(error, 'Failed to update phone number'));
    }
  };

  const buildUsernamePayload = (resolvedUserId: string) => {
    const payload: any = {
      username,
      newUsername: username,
    };

    if (resolvedUserId) {
      payload.id = resolvedUserId;
      payload.customerId = resolvedUserId;
      payload.customer_id = resolvedUserId;
      payload.userId = resolvedUserId;
      payload.userID = resolvedUserId;
      payload._id = resolvedUserId;
    }

    if (userData.email) {
      payload.email = userData.email;
    }

    if (userData.phoneNumber) {
      payload.phoneNumber = userData.phoneNumber;
    }

    return payload;
  };

  const ensurePhoneVerification = async (targetPhone: string): Promise<boolean> => {
    if (!targetPhone) {
      Alert.alert('Verification Required', 'Phone number is required for OTP verification.');
      return false;
    }

    setOtpLoading(true);
    try {
      await sendPhoneOtp({ phoneNumber: targetPhone });
      navigation.navigate('OTP', {
        flow: 'verify-only',
        verificationType: 'phone',
        type: 'phone',
        value: targetPhone,
        phoneNumber: targetPhone,
        returnTo: 'EditProfile',
        returnToKey: route?.key,
      });
    } catch (sendErr: any) {
      Alert.alert('OTP Error', getErrorMessage(sendErr, 'Failed to send OTP. Please try again.'));
    } finally {
      setOtpLoading(false);
    }
    return false;
  };

  const startEmailOtpStep = async (
    targetEmail: string,
    step: 'old' | 'new',
    pendingNewEmail: string
  ) => {
    if (!targetEmail) {
      Alert.alert('Verification Required', 'Email is required for OTP verification.');
      return;
    }

    setOtpLoading(true);
    try {
      await sendEmailOtp({ email: targetEmail });
      navigation.navigate('OTP', {
        flow: 'verify-only',
        verificationType: 'email',
        verificationStep: step,
        type: 'email',
        value: targetEmail,
        email: targetEmail,
        returnTo: 'EditProfile',
            returnToKey: route?.key,
        pendingNewEmail,
          oldEmailVerifiedOtp: verifiedOldEmailOtp,
      });
      Alert.alert(
        'OTP Required',
        step === 'old'
          ? 'Verify OTP sent to your current email, then press Update again.'
          : 'Verify OTP sent to your new email, then press Update again.'
      );
    } catch (sendErr: any) {
      Alert.alert('OTP Error', getErrorMessage(sendErr, 'Failed to send email OTP. Please try again.'));
    } finally {
      setOtpLoading(false);
    }
  };

  const applyEmailChange = async (
    resolvedUserId: string,
    activeToken: string | null,
    overrideOldEmailOtp?: string,
    overrideNewEmailOtp?: string
  ) => {
    if (activeToken) {
      setAuthToken(activeToken);
    }

    const emailPayload: any = {
      email: normalizedCurrentEmail || normalizedNewEmail,
      newEmail: normalizedNewEmail,
      oldEmail: normalizedCurrentEmail,
      otp: (overrideNewEmailOtp || verifiedNewEmailOtp || overrideOldEmailOtp || verifiedOldEmailOtp).trim(),
      oldEmailOtp: (overrideOldEmailOtp || verifiedOldEmailOtp).trim(),
      newEmailOtp: (overrideNewEmailOtp || verifiedNewEmailOtp).trim(),
      old_email: normalizedCurrentEmail,
      new_email: normalizedNewEmail,
    };

    if (resolvedUserId) {
      emailPayload.id = resolvedUserId;
      emailPayload.customerId = resolvedUserId;
      emailPayload.customer_id = resolvedUserId;
      emailPayload.userId = resolvedUserId;
      emailPayload.userID = resolvedUserId;
      emailPayload._id = resolvedUserId;
    }

    const emailResp: any = await changeEmail(emailPayload);
    console.log('Change email response:', emailResp);
    const { success: emailSuccess, message: emailMessage } = isApiSuccess(emailResp);
    if (!emailSuccess) {
      throw new Error(emailMessage || 'Failed to update email');
    }
  };


  const handleUpdate = async () => {
    try {
      const activeToken = token || userData.token || null;
      const resolvedUserId = userData.id || getUserIdFromToken(activeToken);
      let nextProfileImage = userData.profileImage || '';
      if (activeToken) {
        setAuthToken(activeToken);
      }

      if (profileImageChanged && profileImageUri) {
        const profileImageResp = await changeProfileImage({
          imageUri: profileImageUri,
          id: resolvedUserId,
          customerId: resolvedUserId,
          customer_id: resolvedUserId,
          userId: resolvedUserId,
          userID: resolvedUserId,
          _id: resolvedUserId,
        });
        nextProfileImage = extractProfileImageUrl(profileImageResp) || profileImageUri;
      }

      if (phoneChanged && !isPhoneVerified) {
        const verified = await ensurePhoneVerification(normalizedNewPhone);
        if (!verified) return;
      }

      if (phoneChanged) {
        if (!verifiedPhoneOtp) {
          Alert.alert('Verification Required', 'Please verify the new phone number first.');
          return;
        }

        const phonePayload: any = {
          phoneNumber: normalizedNewPhone,
          newPhoneNumber: normalizedNewPhone,
          currentPhoneNumber: normalizedCurrentPhone,
          otp: verifiedPhoneOtp,
        };
        if (resolvedUserId) {
          phonePayload.id = resolvedUserId;
          phonePayload.customerId = resolvedUserId;
          phonePayload.customer_id = resolvedUserId;
          phonePayload.userId = resolvedUserId;
          phonePayload.userID = resolvedUserId;
          phonePayload._id = resolvedUserId;
        }

        const phoneResp: any = await changePhoneNumber(phonePayload);
        console.log('Change phone response:', phoneResp);
        const { success: phoneSuccess, message: phoneMessage } = isApiSuccess(phoneResp);
        if (!phoneSuccess) {
          Alert.alert('Error', phoneMessage || 'Failed to update phone number');
          return;
        }
      }

      // If username changed and backend supports changing username, call API
      if (usernameChanged) {
        const payload = buildUsernamePayload(resolvedUserId);

        console.log('Change username payload:', payload);
        // ensure api has token from storage
        try {
          if (activeToken) setAuthToken(activeToken);
        } catch (e) {
          console.warn('Failed to load token from context', e);
        }

        try {
          const resp: any = await changeUsername(payload);
          console.log('Change username response:', resp);
          const { success, message } = isApiSuccess(resp);

          if (!success) {
            Alert.alert('Error', message || 'Failed to update username');
            return;
          }
        } catch (usernameErr: any) {
          const usernameErrMsg = getErrorMessage(usernameErr);
          const requiresOtp = isOtpRequiredError(usernameErrMsg);

          if (!requiresOtp) {
            throw usernameErr;
          }

          const targetPhone = normalizedNewPhone || normalizedCurrentPhone;
          const verified = await ensurePhoneVerification(targetPhone);
          if (!verified) return;

          const retryResp: any = await changeUsername(payload);
          const { success: retrySuccess, message: retryMessage } = isApiSuccess(retryResp);

          if (!retrySuccess) {
            Alert.alert('Error', retryMessage || 'Failed to update username');
            return;
          }
        }
      }

      if (emailChanged) {
        const newVerified = isNewEmailVerified || !!route?.params?.emailNewVerified;

        if (!newVerified) {
          if (newEmailOtpSentRef.current !== normalizedNewEmail) {
            newEmailOtpSentRef.current = normalizedNewEmail;
            await startEmailOtpStep(normalizedNewEmail, 'new', normalizedNewEmail);
          }
          return;
        }

        await applyEmailChange(resolvedUserId, activeToken);
        navigation.setParams({
          emailOldVerified: undefined,
          emailNewVerified: undefined,
          oldEmailVerifiedOtp: undefined,
          newEmailVerifiedOtp: undefined,
          pendingNewEmail: undefined,
        });
      }

      if (passwordChanged) {
        if (!userData.password) {
          Alert.alert('Error', 'Current password is missing. Please login again and try updating password.');
          return;
        }

        const phoneForPasswordPayload = phoneChanged ? normalizedNewPhone : (userData.phoneNumber || '').trim();

        const passwordPayload: any = {
          oldPassword: userData.password,
          newPassword: password,
        };

        if (resolvedUserId) {
          passwordPayload.id = resolvedUserId;
          passwordPayload.customerId = resolvedUserId;
          passwordPayload.customer_id = resolvedUserId;
          passwordPayload.userId = resolvedUserId;
          passwordPayload.userID = resolvedUserId;
          passwordPayload._id = resolvedUserId;
        }

        if (userData.email) {
          passwordPayload.email = userData.email;
        }

        if (phoneForPasswordPayload) {
          passwordPayload.phoneNumber = phoneForPasswordPayload;
        }

        try {
          const passwordResp: any = await changePassword(passwordPayload);
          const { success: passwordSuccess, message: passwordMessage } = isApiSuccess(passwordResp);

          if (!passwordSuccess) {
            Alert.alert('Error', passwordMessage || 'Failed to update password');
            return;
          }
        } catch (passwordErr: any) {
          const passwordErrMsg = getErrorMessage(passwordErr, 'Failed to update password');
          Alert.alert('Error', passwordErrMsg);
          return;
        }
      }

      // Update local context regardless
      await saveProfileImageForAccount(
        {
          id: resolvedUserId || userData.id || '',
          email: userData.email ? email : userData.email,
          phoneNumber: userData.phoneNumber ? phoneNumber : userData.phoneNumber,
        },
        nextProfileImage
      );

      setUserData({
        name: username,
        email: userData.email ? email : userData.email,
        phoneNumber: userData.phoneNumber ? phoneNumber : userData.phoneNumber,
        profileImage: nextProfileImage,
        password: password,
        token: userData.token || token || '',
        id: resolvedUserId || '',
      });

      const successMessage = 'Updated successfully';
      Alert.alert('Success', successMessage, [
        {
          text: 'OK',
          onPress: () => {
            setIsUpdated(true);
            navigation.navigate('AccountView', { username, email, phoneNumber, profileImage: nextProfileImage });
          },
        },
      ]);
    } catch (err: any) {
      const errMsg = String(err?.message || err || '');
      console.error('Edit profile update error:', err);
      Alert.alert('Error', errMsg || 'Failed to update profile');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          iconColor="#fff"
          size={24}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
        <View style={styles.headerTitleContainer}>
          <Text variant="titleLarge" style={styles.headerTitle}>
            Edit Profile
          </Text>
          {isUpdated && (
            <Text style={styles.successMessage}>
              Profile Updated Successfully!
            </Text>
          )}
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileImageContainer}>
          <TouchableOpacity style={styles.avatarPlaceholder} onPress={handlePickProfileImage}>
            {profileImageUri ? (
              <Image source={{ uri: profileImageUri }} style={styles.avatarImage} />
            ) : (
              <IconButton icon="camera" size={40} iconColor="#999" />
            )}
          </TouchableOpacity>
          <Text style={styles.uploadText}>{profileImageUri ? 'Tap to change profile picture' : 'Upload Profile Picture'}</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            mode="outlined"
            placeholder="Harry"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            textColor="#000"
            outlineColor="#E0E0E0"
            activeOutlineColor="#1A80A4"
          />

          {userData.email ? (
            <>
              <Text style={styles.label}>Email</Text>
              <TextInput
                mode="outlined"
                placeholder="Enter your email"
                onChangeText={handleEmailChange}
                value={email}
                editable={true}
                keyboardType="email-address"
                style={styles.input}
                textColor="#000"
                outlineColor="#E0E0E0"
                activeOutlineColor="#1A80A4"
              />

              {emailChanged ? (
                <Text style={styles.helperText}>
                  {!isNewEmailVerified
                    ? 'Press Update to verify OTP from your new email.'
                    : 'Email OTP verification completed. Press Update to complete email change.'}
                </Text>
              ) : null}
            </>
          ) : null}

          {userData.phoneNumber ? (
            <>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                mode="outlined"
                placeholder="Enter phone number"
                value={phoneNumber}
                onChangeText={handlePhoneNumberChange}
                keyboardType="phone-pad"
                style={styles.input}
                textColor="#000"
                outlineColor="#E0E0E0"
                activeOutlineColor="#1A80A4"
              />

              {phoneChanged || usernameChanged ? (
                <Text style={styles.helperText}>
                  Press Update to verify the phone number on the next page.
                </Text>
              ) : null}
            </>
          ) : null}

          <Text style={styles.label}>Password</Text>
          <TextInput
            mode="outlined"
            placeholder="Enter password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            right={<TextInput.Icon icon={showPassword ? "eye-off-outline" : "eye-outline"} onPress={() => setShowPassword(!showPassword)} />}
            style={styles.input}
            textColor="#000"
            outlineColor="#E0E0E0"
            activeOutlineColor="#1A80A4"
          />
        </View>

        <Button
          mode="contained"
          onPress={isUpdated ? () => navigation.navigate('Login') : handleUpdate}
          style={styles.updateButton}
          labelStyle={styles.updateButtonLabel}
          loading={otpLoading}
          disabled={otpLoading}
        >
          {isUpdated ? 'Login' : 'Update'}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#17a2b8',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingBottom: 25,
    paddingHorizontal: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButton: {
    margin: 0,
    marginTop: 5,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 10,
  },
  headerTitle: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  successMessage: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 5,
  },
  headerSpacer: {
    width: 48,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  uploadText: {
    color: '#666',
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#000',
  },
  disabledInput: {
    backgroundColor: '#F0F0F0',
  },
  helperText: {
    color: '#666',
    fontSize: 12,
    marginTop: 6,
  },
  verifiedText: {
    color: '#0C8A43',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '600',
  },
  updateButton: {
    backgroundColor: '#17a2b8',
    borderRadius: 30,
    paddingVertical: 12,
    marginTop: 20,
  },
  updateButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default EditProfileScreen;
