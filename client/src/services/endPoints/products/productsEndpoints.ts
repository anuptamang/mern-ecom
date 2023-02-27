import axios from "axios"
import { PRODUCTS_API } from "services/servicesConstants"
import { IProductSliceParams } from "types/store/products/productSliceTypes"


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