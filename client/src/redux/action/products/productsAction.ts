import { createAsyncThunk } from "@reduxjs/toolkit";
import { getProducts } from "services/endPoints/products";
import { IProduct, IProductSliceParams } from "types/store/productSliceTypes";

export const fetchProducts = createAsyncThunk<IProduct[], IProductSliceParams>("products/fetchProducts", async (params) => {
  const { category } = params;
  const response = await getProducts({ category })
  return response.data
})