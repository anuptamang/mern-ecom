import axios from "axios";
import { CARTS_API } from "services/servicesConstants";

export const getMyCartApi = async (token: string) => {
  return axios.get(`${CARTS_API}/me`, { headers: { Authorization: `Bearer ${token}` } });
};

export const addCartItemApi = async (token: string, payload: { productId: string; quantity?: number }) => {
  return axios.post(`${CARTS_API}/items`, payload, { headers: { Authorization: `Bearer ${token}` } });
};

export const updateCartItemApi = async (token: string, payload: { productId: string; quantity: number }) => {
  return axios.patch(`${CARTS_API}/items`, payload, { headers: { Authorization: `Bearer ${token}` } });
};

export const removeCartItemApi = async (token: string, productId: string) => {
  return axios.delete(`${CARTS_API}/items/${productId}`, { headers: { Authorization: `Bearer ${token}` } });
};

export const clearCartApi = async (token: string) => {
  return axios.delete(`${CARTS_API}/clear`, { headers: { Authorization: `Bearer ${token}` } });
};

export const getSellerCartItemsApi = async (token: string) => {
  return axios.get(`${CARTS_API}/seller`, { headers: { Authorization: `Bearer ${token}` } });
};
