import axios from "axios";
import { BACKEND_API } from "configs/api";
import { getToken } from "utils/localStorage";

const NOTIFICATIONS_API = `${BACKEND_API}/notifications`;

export const getNotificationsApi = async (params?: {
  read?: boolean;
  limit?: number;
  skip?: number;
}) => {
  const token = getToken() || "";
  const queryParams = new URLSearchParams();
  if (params?.read !== undefined) {
    queryParams.append("read", String(params.read));
  }
  if (params?.limit) {
    queryParams.append("limit", String(params.limit));
  }
  if (params?.skip) {
    queryParams.append("skip", String(params.skip));
  }

  const url = queryParams.toString()
    ? `${NOTIFICATIONS_API}?${queryParams.toString()}`
    : NOTIFICATIONS_API;

  return axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getUnreadCountApi = async () => {
  const token = getToken() || "";
  return axios.get(`${NOTIFICATIONS_API}/unread/count`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const markAsReadApi = async (id: string) => {
  const token = getToken() || "";
  return axios.patch(
    `${NOTIFICATIONS_API}/${id}/read`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const markAllAsReadApi = async () => {
  const token = getToken() || "";
  return axios.patch(
    `${NOTIFICATIONS_API}/all/read`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const deleteNotificationApi = async (id: string) => {
  const token = getToken() || "";
  return axios.delete(`${NOTIFICATIONS_API}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteAllNotificationsApi = async () => {
  const token = getToken() || "";
  return axios.delete(NOTIFICATIONS_API, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

