import axios from "axios";
import { BACKEND_API } from "configs/api";
import { getToken } from "utils/localStorage";

const WISHLIST_API = `${BACKEND_API}/wishlist`;

export const addToWishlistApi = async (productId: string) => {
  const token = getToken() || "";
  return axios.post(
    WISHLIST_API,
    { productId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const removeFromWishlistApi = async (productId: string) => {
  const token = getToken() || "";
  return axios.delete(`${WISHLIST_API}/${productId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getMyWishlistApi = async () => {
  const token = getToken() || "";
  return axios.get(`${WISHLIST_API}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const checkWishlistStatusApi = async (productId: string) => {
  const token = getToken() || "";
  return axios.get(`${WISHLIST_API}/check/${productId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getSellerWishlistApi = async () => {
  const token = getToken() || "";
  return axios.get(`${WISHLIST_API}/seller`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

