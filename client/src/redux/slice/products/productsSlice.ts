import { createSlice } from '@reduxjs/toolkit'
import { fetchProducts } from 'redux/action/products'
import { IProductSlice } from 'types/store/productSliceTypes'

const initialState: IProductSlice = {
  productList: {
    data: [],
    currentPage: null,
    numberOfPages: 0
  },
  status: {
    loading: false,
    success: false,
    error: false
  }
}

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchProducts.pending, (state) => {
      state.status = { ...state.status, loading: true };
    });
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.productList = { ...state.productList, ...action.payload };
      state.status = { ...state.status, loading: false, success: true };
    });
    builder.addCase(fetchProducts.rejected, (state) => {
      state.status = { ...state.status, error: true };
    });
  }
})

export { productsSlice }
export const productsSelector = (state: { products: IProductSlice }) => state.products
