import { apiClient } from './client';
import { UserProfile } from '../types/api';

export const loginWithEmail = async (email: string, password: string) => {
  const { data } = await apiClient.post<{
    user: UserProfile;
    token: string;
    refreshToken: string;
  }>('/login', { email, password });
  return data;
};

export const registerUser = async (username: string, email: string, password: string) => {
  const { data } = await apiClient.post<{ user: UserProfile }>('/register', {
    username,
    email,
    password,
  });
  return data;
};

export const logoutUser = async (refreshToken: string) => {
  await apiClient.post('/logout', { refreshToken });
};

export const refreshAccessToken = async (refreshToken: string) => {
  const { data } = await apiClient.post<{ accessToken: string }>('/refresh', {
    refreshToken,
  });
  return data;
};

export const requestPasswordReset = async (email: string) => {
  const { data } = await apiClient.post('/password-reset/request', { email });
  return data;
};

export const verifyResetCode = async (email: string, code: string) => {
  const { data } = await apiClient.post<{ resetToken: string }>(
    '/password-reset/verify',
    { email, code }
  );
  return data;
};

export const confirmPasswordReset = async (resetToken: string, newPassword: string) => {
  const { data } = await apiClient.post('/password-reset/confirm', {
    resetToken,
    newPassword,
  });
  return data;
};
