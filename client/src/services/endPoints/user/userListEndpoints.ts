import axios from "axios";
import { AUTH_API } from "services/servicesConstants";
import { getToken } from "utils/localStorage";

export const getUsersApi = async (filters?: { role?: string }) => {
  const token = getToken() || "";
  const params = new URLSearchParams();
  if (filters?.role) {
    params.append("role", filters.role);
  }
  
  return axios.get(`${AUTH_API}/list?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const createUserApi = async (userData: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: string;
  delivererType?: string;
  deliveryAgencyId?: string;
}) => {
  const token = getToken() || "";
  return axios.post(`${AUTH_API}/create`, userData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const changePasswordApi = async (data: {
  oldPassword: string;
  newPassword: string;
}) => {
  const token = getToken() || "";
  return axios.put(`${AUTH_API}/reset-password`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const resetPasswordAdminApi = async (data: {
  userId: string;
  newPassword: string;
}) => {
  const token = getToken() || "";
  return axios.post(`${AUTH_API}/reset-password-admin`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getProfileCompletionApi = async () => {
  const token = getToken() || "";
  return axios.get(`${AUTH_API}/profile-completion`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Workload endpoints
export const getWorkloadDashboardApi = async () => {
  const token = getToken() || "";
  return axios.get(`${AUTH_API}/workload/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getUserWorkloadApi = async (userId: string) => {
  const token = getToken() || "";
  return axios.get(`${AUTH_API}/workload/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
