import axios from 'axios';
import { AUTH_API } from '@/services/servicesConstants';

export const getUserApi = async (token: string, id: string) => {
  return axios.get(`${AUTH_API}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
};

export const updateUserApi = async (token: string, id: string, payload: any) => {
  return axios.patch(`${AUTH_API}/${id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
};

export const getUserStatsApi = async (token: string) => {
  return axios.get(`${AUTH_API}/stats`, { headers: { Authorization: `Bearer ${token}` } });
};
