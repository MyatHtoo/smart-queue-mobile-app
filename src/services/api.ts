// src/services/api.ts

const BASE_URL = 'https://smart-q-backend-nestjs.onrender.com';
const API_URL = `${BASE_URL}/api`;

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

type RequestOptions = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  skipAuth?: boolean;
};

async function request<T>(
  endpoint: string,
  options: RequestOptions
): Promise<T> {
  const { method, body, headers, skipAuth } = options;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); 

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authToken && !skipAuth) {
    defaultHeaders['Authorization'] = `Bearer ${authToken}`;
  }

  const config: RequestInit = {
    method,
    signal: controller.signal,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const url = `${API_URL}${endpoint}`;
  console.log(`[API] ${method} ${url}`);

  try {
    const response = await fetch(url, config);
    clearTimeout(timeout);

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message =
        Array.isArray(responseData.message)
          ? responseData.message.join(', ')
          : responseData.message || `Request failed (${response.status})`;

      throw new Error(message);
    }

    return responseData as T;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout. Please check your connection.');
    }
    throw error;
  }
}

export type RegisterCustomerPayload = {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
};

export type LoginCustomerPayload = {
  usernameOrEmail?: string;
  phoneNumber?: string;
  password: string;
};

export const registerCustomer = (data: RegisterCustomerPayload) => {
  return request<{
    data: {
      success: boolean;
      message: string;
    };
  }>('/customers/register', {
    method: 'POST',
    body: data,
  });
};

export const loginCustomer = (data: LoginCustomerPayload) => {
  return request<{
    data: {
      accessToken: string;
      user: any;
    };
  }>('/customers/login', {
    method: 'POST',
    body: data,
  });
};

export type SendPhoneOtpResponse = {
  data?: {
    success: boolean;
    message: string;
    otp?: string;
    otpCode?: string;
    verificationCode?: string;
    data?: {
      otp?: string;
      otpCode?: string;
      verificationCode?: string;
    };
  };
  otp?: string;
  otpCode?: string;
  verificationCode?: string;
  code?: string;
};

export const sendPhoneOtp = async (data: { phoneNumber: string }) => {
  const response = await request<SendPhoneOtpResponse>('/customers/send-phone-otp', {
    method: 'POST',
    body: data,
    skipAuth: true,
  });

  const otp =
    response?.data?.otp ??
    response?.data?.otpCode ??
    response?.data?.verificationCode ??
    response?.data?.data?.otp ??
    response?.data?.data?.otpCode ??
    response?.data?.data?.verificationCode ??
    response?.otp ??
    response?.otpCode ??
    response?.verificationCode ??
    response?.code;
  if (otp) {
    console.log('[API] Phone OTP (dev):', otp);
  } else {
    console.log('[API] Phone OTP response (no code returned):', JSON.stringify(response));
  }

  return response;
};


export type VerifyPhoneOtpPayload = {
  phoneNumber: string;
  otp: string;
};

export const verifyPhoneOtp = (data: VerifyPhoneOtpPayload) => {
  return request<{
    data: {
      verified: boolean;
      message: string;
    };
  }>('/customers/verify-phone-otp', {
    method: 'POST',
    body: data,
    skipAuth: true,
  });
};

export type SendEmailOtpResponse = {
  data: {
    success: boolean;
    message: string;
    otp?: string;
  };
  otp?: string;
};

export const sendEmailOtp = async (data: { email: string }) => {
  const normalizedEmail = data.email.trim().toLowerCase();
  console.log('[API] sendEmailOtp normalized email:', normalizedEmail);

  const response = await request<SendEmailOtpResponse>('/customers/send-email-otp', {
    method: 'POST',
    body: { email: normalizedEmail },
    skipAuth: true,
  });

  const otp = response?.data?.otp ?? response?.otp;
  if (otp) {
    console.log('[API] Email OTP (dev):', otp);
  } else {
    console.log('[API] Email OTP not returned by backend.');
  }

  return response;
};

export type VerifyEmailOtpPayload = {
  email: string;
  otp: string;
};

export const verifyEmailOtp = (data: VerifyEmailOtpPayload) => {
  return request<{
    data: {
      verified: boolean;
      message: string;
    };
  }>('/customers/verify-email-otp', {
    method: 'POST',
    body: data,
    skipAuth: true,
  });
};

export type ChangeUsernamePayload = {
  username: string;
  newUsername?: string;
  email?: string;
  phoneNumber?: string;
  id?: string;
  customerId?: string;
  customer_id?: string;
  userId?: string;
  userID?: string;
  _id?: string;
};

export const changeUsername = async (data: ChangeUsernamePayload) => {
  const username = data.newUsername ?? data.username;
  const id = data.id ?? data.customerId ?? data.customer_id ?? data.userId ?? data.userID ?? data._id;

  const basePayload: ChangeUsernamePayload = {
    username,
    newUsername: username,
  };

  const optionalIdentifiers: Pick<ChangeUsernamePayload, 'email' | 'phoneNumber'> = {
    ...(data.email ? { email: data.email } : {}),
    ...(data.phoneNumber ? { phoneNumber: data.phoneNumber } : {}),
  };

  const payloadVariants: ChangeUsernamePayload[] = [
    { ...basePayload, ...optionalIdentifiers },
    { ...basePayload },
    ...(id
      ? [
          { ...basePayload, id },
          { ...basePayload, customerId: id },
          { ...basePayload, customer_id: id },
          { ...basePayload, userId: id },
          { ...basePayload, userID: id },
          { ...basePayload, _id: id },
          { ...basePayload, id, ...optionalIdentifiers },
          { ...basePayload, customerId: id, ...optionalIdentifiers },
          { ...basePayload, customer_id: id, ...optionalIdentifiers },
          { ...basePayload, userId: id, ...optionalIdentifiers },
          { ...basePayload, userID: id, ...optionalIdentifiers },
          { ...basePayload, _id: id, ...optionalIdentifiers },
        ]
      : []),
  ];

  const methods: Array<'POST' | 'PATCH'> = ['POST', 'PATCH'];
  let lastError: any;

  for (const method of methods) {
    for (const payload of payloadVariants) {
      try {
        return await request<{
          data: {
            success: boolean;
            message: string;
            customer?: any;
          };
        }>('/customers/change-username', {
          method,
          body: payload,
        });
      } catch (err: any) {
        lastError = err;
      }
    }
  }

  throw lastError;
};

export type ChangePasswordPayload = {
  oldPassword?: string;
  newPassword?: string;
  oldpassword?: string;
  newpassword?: string;
  email?: string;
  phoneNumber?: string;
  id?: string;
  customerId?: string;
  customer_id?: string;
  userId?: string;
  userID?: string;
  _id?: string;
};

export type ChangeEmailPayload = {
  email?: string;
  currentEmail?: string;
  newEmail?: string;
  oldEmail?: string;
  otp?: string;
  oldEmailOtp?: string;
  newEmailOtp?: string;
  old_email?: string;
  new_email?: string;
  old_email_otp?: string;
  new_email_otp?: string;
  oldOtp?: string;
  newOtp?: string;
  id?: string;
  customerId?: string;
  customer_id?: string;
  userId?: string;
  userID?: string;
  _id?: string;
};

export type ChangePhoneNumberPayload = {
  phoneNumber: string;
  newPhoneNumber?: string;
  currentPhoneNumber?: string;
  oldPhoneNumber?: string;
  phone?: string;
  newPhone?: string;
  currentPhone?: string;
  oldPhone?: string;
  otp: string;
  id?: string;
  customerId?: string;
  customer_id?: string;
  userId?: string;
  userID?: string;
  _id?: string;
};

export type ChangeProfileImagePayload = {
  imageUri: string;
  id?: string;
  customerId?: string;
  customer_id?: string;
  userId?: string;
  userID?: string;
  _id?: string;
};

export const changePhoneNumber = async (data: ChangePhoneNumberPayload) => {
  const newPhoneNumber = (data.newPhoneNumber ?? data.phoneNumber ?? data.newPhone ?? data.phone ?? '').trim();
  const currentPhoneNumber = (data.currentPhoneNumber ?? data.oldPhoneNumber ?? data.currentPhone ?? data.oldPhone ?? '').trim();
  const otp = (data.otp ?? '').trim();
  const id = data.id ?? data.customerId ?? data.customer_id ?? data.userId ?? data.userID ?? data._id;

  if (!newPhoneNumber) {
    throw new Error('New phone number is required.');
  }
  if (!otp) {
    throw new Error('OTP is required.');
  }

  const baseBody: ChangePhoneNumberPayload = {
    ...data,
    phoneNumber: newPhoneNumber,
    newPhoneNumber,
    ...(currentPhoneNumber ? { currentPhoneNumber } : {}),
    ...(currentPhoneNumber ? { oldPhoneNumber: currentPhoneNumber } : {}),
    phone: newPhoneNumber,
    newPhone: newPhoneNumber,
    ...(currentPhoneNumber ? { currentPhone: currentPhoneNumber } : {}),
    ...(currentPhoneNumber ? { oldPhone: currentPhoneNumber } : {}),
    otp,
  };

  const payloadVariants: ChangePhoneNumberPayload[] = [
    { ...baseBody },
    {
      phoneNumber: newPhoneNumber,
      newPhoneNumber,
      ...(currentPhoneNumber ? { currentPhoneNumber } : {}),
      otp,
    },
    {
      phone: newPhoneNumber,
      newPhone: newPhoneNumber,
      ...(currentPhoneNumber ? { oldPhone: currentPhoneNumber } : {}),
      otp,
    } as ChangePhoneNumberPayload,
    ...(id
      ? [
          { ...baseBody, id },
          { ...baseBody, customerId: id },
          { ...baseBody, customer_id: id },
          { ...baseBody, userId: id },
          { ...baseBody, userID: id },
          { ...baseBody, _id: id },
        ]
      : []),
  ];

  const endpoints = [
    '/customers/change-phone-number'
  ];
  const methods: Array<'PATCH' > = ['PATCH'];

  let lastError: any;

  for (const endpoint of endpoints) {
    for (const method of methods) {
      for (const body of payloadVariants) {
        try {
          const resp = await request<{
            success?: boolean;
            message?: string;
            data?: {
              success?: boolean;
              message?: string;
              customer?: any;
            };
          }>(endpoint, {
            method,
            body,
          });

          const message = String(resp?.data?.message ?? resp?.message ?? '');
          const successFlag = resp?.data?.success ?? resp?.success;
          if (successFlag === true || /phone\s*(updated|changed|success)/i.test(message)) {
            return resp;
          }

          lastError = new Error(message || 'Phone change was not confirmed by backend.');
        } catch (err: any) {
          lastError = err;
        }
      }
    }
  }

  throw lastError || new Error('Unable to change phone number right now. Please try again.');
};

export const changeEmail = async (data: ChangeEmailPayload) => {
  const normalizedEmail = (data.newEmail ?? data.email ?? '').trim().toLowerCase();
  const normalizedOldEmail = (data.oldEmail ?? '').trim().toLowerCase();
  const otp = (data.otp ?? '').trim();
  const oldEmailOtp = (data.oldEmailOtp ?? otp).trim();
  const newEmailOtp = (data.newEmailOtp ?? otp).trim();
  const id = data.id ?? data.customerId ?? data.customer_id ?? data.userId ?? data.userID ?? data._id;

  if (!normalizedEmail) {
    throw new Error('Email is required.');
  }

  const baseBody: ChangeEmailPayload = {
    email: normalizedOldEmail || normalizedEmail,
    ...(normalizedOldEmail ? { currentEmail: normalizedOldEmail } : {}),
    newEmail: normalizedEmail,
    ...(normalizedOldEmail ? { oldEmail: normalizedOldEmail } : {}),
    ...(normalizedOldEmail ? { old_email: normalizedOldEmail } : {}),
    ...(otp ? { otp } : {}),
    ...(oldEmailOtp ? { oldEmailOtp } : {}),
    ...(newEmailOtp ? { newEmailOtp } : {}),
    ...(oldEmailOtp ? { old_email_otp: oldEmailOtp } : {}),
    ...(newEmailOtp ? { new_email_otp: newEmailOtp } : {}),
    ...(oldEmailOtp ? { oldOtp: oldEmailOtp } : {}),
    ...(newEmailOtp ? { newOtp: newEmailOtp } : {}),
    ...(normalizedEmail ? { new_email: normalizedEmail } : {}),
  };

  const payloadVariants: ChangeEmailPayload[] = [
    { ...baseBody },
    {
      email: normalizedEmail,
      ...(normalizedOldEmail ? { currentEmail: normalizedOldEmail } : {}),
      ...(normalizedOldEmail ? { oldEmail: normalizedOldEmail } : {}),
      newEmail: normalizedEmail,
      ...(oldEmailOtp ? { oldEmailOtp } : {}),
      ...(newEmailOtp ? { newEmailOtp } : {}),
      ...(otp ? { otp } : {}),
    },
    ...(id
      ? [
          { ...baseBody, id },
          { ...baseBody, customerId: id },
          { ...baseBody, customer_id: id },
          { ...baseBody, userId: id },
          { ...baseBody, userID: id },
          { ...baseBody, _id: id },
        ]
      : []),
  ];

  const methods: Array<'POST' | 'PATCH' | 'PUT'> = ['POST', 'PATCH', 'PUT'];
  let lastError: any;

  for (const method of methods) {
    for (const body of payloadVariants) {
      try {
        const resp = await request<{
          success?: boolean;
          message?: string;
          data: {
            success?: boolean;
            message?: string;
            customer?: any;
          };
        }>('/customers/change-email', {
          method,
          body,
        });
        const message = String(resp?.data?.message ?? resp?.message ?? '');
        const successFlag = resp?.data?.success ?? resp?.success;
        const strictSuccess = successFlag === true || /email\s*(updated|changed|success)/i.test(message);
        if (strictSuccess) {
          return resp;
        }
        lastError = new Error(message || 'Email change was not confirmed by backend.');
      } catch (err: any) {
        lastError = err;
      }
    }
  }

  throw lastError || new Error('Unable to change email right now. Please try again.');
};

export type ChangepwPayload = ChangePasswordPayload;

export const changePassword = async (data: ChangePasswordPayload) => {
  const oldPassword = data.oldPassword ?? data.oldpassword;
  const newPassword = data.newPassword ?? data.newpassword;
  const id = data.id ?? data.customerId ?? data.customer_id ?? data.userId ?? data.userID ?? data._id;

  if (!oldPassword || !newPassword) {
    throw new Error('Both oldPassword and newPassword are required.');
  }

  const baseBody = {
    oldPassword,
    newPassword,
  };

  const optionalIdentifiers = {
    ...(data.email ? { email: data.email } : {}),
    ...(data.phoneNumber ? { phoneNumber: data.phoneNumber } : {}),
  };

  const payloadVariants: ChangePasswordPayload[] = [
    { ...baseBody },
    { ...baseBody, ...optionalIdentifiers },
    ...(id
      ? [
          { ...baseBody, id },
          { ...baseBody, customerId: id },
          { ...baseBody, customer_id: id },
          { ...baseBody, userId: id },
          { ...baseBody, userID: id },
          { ...baseBody, _id: id },
          { ...baseBody, id, ...optionalIdentifiers },
          { ...baseBody, customerId: id, ...optionalIdentifiers },
          { ...baseBody, customer_id: id, ...optionalIdentifiers },
          { ...baseBody, userId: id, ...optionalIdentifiers },
          { ...baseBody, userID: id, ...optionalIdentifiers },
          { ...baseBody, _id: id, ...optionalIdentifiers },
        ]
      : []),
  ];

  const methods: Array<'POST' | 'PATCH'> = ['POST', 'PATCH'];
  let lastError: any;

  for (const method of methods) {
    for (const body of payloadVariants) {
      try {
        return await request<{
          data: {
            success: boolean;
            message: string;
            customer?: any;
          };
        }>('/customers/change-password', {
          method,
          body,
        });
      } catch (err: any) {
        lastError = err;
      }
    }
  }

  throw lastError || new Error('Unable to change password right now. Please try again.');
};

export const changepw = (data: ChangePasswordPayload) => changePassword(data);

export const changeProfileImage = async (data: ChangeProfileImagePayload) => {
  const imageUri = (data.imageUri || '').trim();
  if (!imageUri) {
    throw new Error('Profile image is required.');
  }

  const uriParts = imageUri.split('/');
  const rawFileName = uriParts[uriParts.length - 1] || `profile-${Date.now()}.jpg`;
  const fileName = rawFileName.includes('.') ? rawFileName : `${rawFileName}.jpg`;
  const ext = fileName.split('.').pop()?.toLowerCase();
  const mimeType =
    ext === 'png'
      ? 'image/png'
      : ext === 'webp'
        ? 'image/webp'
        : 'image/jpeg';

  const id = data.id ?? data.customerId ?? data.customer_id ?? data.userId ?? data.userID ?? data._id;
  const url = `${API_URL}/customers/change-profileImage`;
    const fieldCandidates = ['profileImage', 'image', 'file', 'avatar', 'photo'];

  const headers: Record<string, string> = {};
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

    let lastError: any;

    for (const fieldName of fieldCandidates) {
      const formData = new FormData();
      formData.append(fieldName, {
        uri: imageUri,
        name: fileName,
        type: mimeType,
      } as any);

      if (id) {
        formData.append('id', id);
        formData.append('customerId', id);
        formData.append('customer_id', id);
        formData.append('userId', id);
        formData.append('userID', id);
        formData.append('_id', id);
      }

      console.log(`[API] PATCH ${url} (field: ${fieldName})`);

      const response = await fetch(url, {
        method: 'PATCH',
        headers,
        body: formData,
      });

      const responseData = await response.json().catch(() => ({}));
      if (response.ok) {
        return responseData;
      }

      const message =
        Array.isArray(responseData?.message)
          ? responseData.message.join(', ')
          : responseData?.message || `Request failed (${response.status})`;

      lastError = new Error(message);
      if (!/unexpected field/i.test(String(message))) {
        throw lastError;
      }
    }

    throw lastError || new Error('Unable to upload profile image right now. Please try again.');
};


export const getShops = () => {
  return request<any>('/shops/all', {
    method: 'GET',
  });
};


export default {
  registerCustomer,
  loginCustomer,
  sendPhoneOtp,
  verifyPhoneOtp,
  sendEmailOtp,
  verifyEmailOtp,
  changeEmail,
  changePassword,
  changeProfileImage,
  changepw,
  getShops,
};
