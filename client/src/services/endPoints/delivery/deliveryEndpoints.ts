import axios from "axios";
import { BACKEND_API } from "configs/api";
import { getToken } from "utils/localStorage";

export const DELIVERY_API = `${BACKEND_API}/delivery`;

export const getDeliveryTrackingApi = async (orderId: string) => {
  const token = getToken() || "";
  return axios.get(`${DELIVERY_API}/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateDeliveryStatusApi = async (orderId: string, status: string, note?: string, orderItemId?: string, productId?: string, deliveryPersonId?: string) => {
  const token = getToken() || "";
  return axios.patch(
    `${DELIVERY_API}/${orderId}/status`,
    { status, note, orderItemId, productId, deliveryPersonId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const cancelOrderApi = async (orderId: string, reason?: string) => {
  const token = getToken() || "";
  return axios.post(
    `${DELIVERY_API}/${orderId}/cancel`,
    { reason },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const getRefundStatusApi = async (orderId: string) => {
  const token = getToken() || "";
  return axios.get(`${DELIVERY_API}/${orderId}/refund`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
