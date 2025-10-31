import axios from "axios"
import { PRODUCTS_API } from "services/servicesConstants"
import { IProductSliceParams } from "types/store/products/productSliceTypes"
import { getToken } from "utils/localStorage"


export const fetchProductsApi = async ({ category }: IProductSliceParams) => {
  return axios.get(
    PRODUCTS_API,
    {
      params: {
        category: category ? category : null
      }
    }
  )
}

export const fetchMyProductsApi = async () => {
  const token = getToken() || '';
  return axios.get(`${PRODUCTS_API}/me`, { headers: { Authorization: `Bearer ${token}` } });
}

export const fetchProductByIdApi = async (id: string) => {
  return axios.get(`${PRODUCTS_API}/${id}`);
}

export const fetchRelatedProductsApi = async (id: string, limit: number = 4) => {
  return axios.get(`${PRODUCTS_API}/${id}/related`, {
    params: { limit }
  });
}

export const fetchProductRatingsApi = async (id: string) => {
  return axios.get(`${PRODUCTS_API}/${id}/ratings`);
}

export const addProductRatingApi = async (id: string, rating: number, review?: string) => {
  const token = getToken() || '';
  return axios.post(
    `${PRODUCTS_API}/${id}/ratings`,
    { rating, review },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export const fetchProductCommentsApi = async (id: string) => {
  return axios.get(`${PRODUCTS_API}/${id}/comments`);
}

export const addProductCommentApi = async (id: string, text: string, userId: string) => {
  const token = getToken() || '';
  return axios.post(
    `${PRODUCTS_API}/${id}/comments`,
    { text, userId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export const likeProductCommentApi = async (productId: string, commentId: string) => {
  const token = getToken() || '';
  return axios.patch(
    `${PRODUCTS_API}/${productId}/comments/${commentId}/like`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export const deleteProductApi = async (id: string) => {
  const token = getToken() || '';
  return axios.delete(
    `${PRODUCTS_API}/${id}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
}