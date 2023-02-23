import axios from "axios"
import { IProduct, IProductSliceParams } from "types/store/productSliceTypes"
import { PRODUCTS_API } from "../../constants"

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