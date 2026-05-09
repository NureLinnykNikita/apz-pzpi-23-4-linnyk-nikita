import { apiClient } from './client';
import { LeaderboardResponse } from '../types/api';

export const getLeaderboard = async (params: {
  period?: 'week' | 'month' | 'all';
  languageId?: number;
  limit?: number;
}) => {
  const { data } = await apiClient.get<LeaderboardResponse>('/leaderboard', {
    params,
  });
  return data;
};
