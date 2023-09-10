import { createSlice } from '@reduxjs/toolkit'
import { fetchProducts } from 'redux/action/products'
import { IProductSlice } from 'types/store/products/productSliceTypes'

const initialState: IProductSlice = {
  productList: {
    data: [],
    currentPage: null,
    numberOfPages: 0
  },
  status: {
    loading: false,
    success: false,
    error: {
      message: ''
    } || null
  }
}

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchProducts.pending, (state) => {
      state.status.loading = true;
    });
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.productList = { ...state.productList, ...action.payload };
      state.status.loading = false;
      state.status.success = true;
    });
    builder.addCase(fetchProducts.rejected, (state, action) => {
      state.status.loading = false;
      // state.status.error.message = action.error.message;
    });
  }
})

export { productsSlice }
export const productsSelector = (state: { products: IProductSlice }) => state.products
