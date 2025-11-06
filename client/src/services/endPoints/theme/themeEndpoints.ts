/**
 * Theme API Endpoints
 * Site-wide theme management
 */

import apiClient from '@/utils/apiClient';

export const getActiveThemeApi = () => {
  return apiClient.get('/theme/active');
};

export const updateThemeApi = (themeData: any) => {
  return apiClient.put('/theme/update', themeData);
};

export const resetThemeApi = () => {
  return apiClient.post('/theme/reset');
};

export const getThemeHistoryApi = () => {
  return apiClient.get('/theme/history');
};
