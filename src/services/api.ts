// src/services/api.ts

const BASE_URL = 'https://smart-q-backend-nestjs.onrender.com';
const API_URL = `${BASE_URL}/api`;

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

  const config: RequestInit = {
    method,
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json',
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
  username: string;
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



export default {
  registerCustomer,
  loginCustomer,
  sendPhoneOtp,
  verifyPhoneOtp,
};
