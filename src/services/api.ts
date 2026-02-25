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
};

async function request<T>(
  endpoint: string,
  options: RequestOptions
): Promise<T> {
  const { method, body, headers } = options;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); 

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
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
  console.log(`[API] ${method} ${url}`, body ?? '');

  try {
    const response = await fetch(url, config);
    clearTimeout(timeout);

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message =
        Array.isArray(responseData.message)
          ? responseData.message.join(', ')
          : responseData.message || `Request failed (${response.status})`;

      console.log('[API] Error:', message);
      throw new Error(message);
    }

    return responseData as T;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout. Please check your connection.');
    }
    console.log('[API] Fetch error:', error.message);
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
  data: {
    success: boolean;
    message: string;
  };
};

export const sendPhoneOtp = (data: { phoneNumber: string }) => {
  return request<SendPhoneOtpResponse>('/customers/send-phone-otp', {
    method: 'POST',
    body: data,
  });
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
  });
};

export type SendEmailOtpResponse = {
  data: {
    success: boolean;
    message: string;
  };
};

export const sendEmailOtp = (data: { email: string }) => {
  return request<SendEmailOtpResponse>('/customers/send-email-otp', {
    method: 'POST',
    body: data,
  });
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
  });
};

export type ChangeUsernamePayload = {
  username: string;
  email?: string;
  phoneNumber?: string;
  id?: string;
};

export const changeUsername = async (data: ChangeUsernamePayload) => {
  // Try POST first (common), but some backends may expect PATCH/PUT.
  try {
    return await request<{
      data: {
        success: boolean;
        message: string;
        customer?: any;
      };
    }>('/customers/change-username', {
      method: 'POST',
      body: data,
    });
  } catch (err: any) {
    const msg = String(err?.message || err || '');
    if (/cannot post/i.test(msg) || /not found/i.test(msg) || /cannot (post|put|patch)/i.test(msg)) {
      try {
        return await request<{
          data: {
            success: boolean;
            message: string;
            customer?: any;
          };
        }>('/customers/change-username', {
          method: 'PATCH',
          body: data,
        });
      } catch (err2: any) {
        throw err2;
      }
    }

    throw err;
  }
};


export default {
  registerCustomer,
  loginCustomer,
  sendPhoneOtp,
  verifyPhoneOtp,
  sendEmailOtp,
  verifyEmailOtp,
};
