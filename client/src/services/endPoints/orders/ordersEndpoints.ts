import axios from "axios";
import { BACKEND_API } from "configs/api";

export const createOrderApi = async (
  token: string,
  payload: { paymentIntentId?: string; amount?: number; currency?: string; items?: any[] }
) => {
  return axios.post(`${BACKEND_API}/orders`, payload, { headers: { Authorization: `Bearer ${token}` } });
};

export const listMyOrdersApi = async (token: string) => {
  return axios.get(`${BACKEND_API}/orders/me`, { headers: { Authorization: `Bearer ${token}` } });
};

export const getSellerOrdersApi = async (token: string) => {
  return axios.get(`${BACKEND_API}/orders/seller`, { headers: { Authorization: `Bearer ${token}` } });
};
