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