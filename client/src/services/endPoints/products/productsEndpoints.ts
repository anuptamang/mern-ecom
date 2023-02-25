import axios from "axios"
import { PRODUCTS_API } from "services/servicesConstants"
import { IProduct, IProductSliceParams } from "types/store/productSliceTypes"


export const getProducts = async ({ category }: IProductSliceParams) => {
  return axios.get<IProduct[]>(
    PRODUCTS_API,
    {
      params: {
        category: category ? category : null
      }
    }
  )
}