import { apiClient } from './client';
import { UserProfile, UserStats, UserSettings, Achievement, Language } from '../types/api';

export const getMyProfile = async () => {
  const { data } = await apiClient.get<{ user: UserProfile }>('/users/me');
  return data.user;
};

export const updateMyProfile = async (fields: Partial<UserProfile>) => {
  const { data } = await apiClient.patch<{ user: UserProfile }>('/users/me', fields);
  return data.user;
};

export const getMyStats = async () => {
  const { data } = await apiClient.get<{ userStats: UserStats }>('/users/me/stats');
  return data.userStats;
};

export const completeOnboarding = async (
  targetLanguageId: number,
  dailyGoalMinutes: number
) => {
  const { data } = await apiClient.patch<{ user: UserProfile }>('/users/me/onboarding', {
    targetLanguageId,
    dailyGoalMinutes,
  });
  return data.user;
};

export const getSettings = async () => {
  const { data } = await apiClient.get<{ settings: UserSettings }>('/users/me/settings');
  return data.settings;
};

export const updateSettings = async (settings: Partial<UserSettings>) => {
  const { data } = await apiClient.patch<{ settings: UserSettings }>(
    '/users/me/settings',
    settings
  );
  return data.settings;
};

export const getUserAchievements = async (userId: string) => {
  const { data } = await apiClient.get<{
    userAchievements: Array<{
      achievementId: number;
      earnedAt: string;
      achievement: Omit<Achievement, 'earnedAt'>;
    }>;
  }>(`/users/${userId}/achievements`);
  return data.userAchievements.map((ua) => ({
    ...ua.achievement,
    earnedAt: ua.earnedAt,
  }));
};

export const getUserLanguages = async (userId: string) => {
  const { data } = await apiClient.get<{ languages: Language[] }>(
    `/users/${userId}/languages`
  );
  return data.languages;
};
