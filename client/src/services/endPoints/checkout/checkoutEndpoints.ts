import axios from "axios";
import { BACKEND_API } from "configs/api";

export const createPaymentIntentApi = async (token: string, payload?: { amount?: number; currency?: string }) => {
  return axios.post(`${BACKEND_API}/checkout/create-payment-intent`, payload ?? {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
