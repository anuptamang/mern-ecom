import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ICartSlice } from 'types/store/carts/cartSliceTypes';
import { addCartItemApi, clearCartApi, getMyCartApi, removeCartItemApi, updateCartItemApi } from 'services/endPoints/carts/cartsEndpoints';
import { getToken } from 'utils/localStorage';

export const fetchMyCart = createAsyncThunk('carts/fetchMyCart', async () => {
  const token = getToken();
  const res = await getMyCartApi(token || '');
  return res.data;
});

export const addToCart = createAsyncThunk('carts/addToCart', async (payload: { productId: string; quantity?: number }) => {
  const token = getToken();
  const res = await addCartItemApi(token || '', payload);
  return res.data;
});

export const updateCartItem = createAsyncThunk('carts/updateCartItem', async (payload: { productId: string; quantity: number }) => {
  const token = getToken();
  const res = await updateCartItemApi(token || '', payload);
  return res.data;
});

export const removeFromCart = createAsyncThunk('carts/removeFromCart', async (productId: string) => {
  const token = getToken();
  const res = await removeCartItemApi(token || '', productId);
  return res.data;
});

export const clearCart = createAsyncThunk('carts/clearCart', async () => {
  const token = getToken();
  const res = await clearCartApi(token || '');
  return res.data;
});

const initialState: ICartSlice = {
  items: [],
  totalCount: 0,
  totalPrice: 0,
};

const cartsSlice = createSlice({
  name: 'carts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    const assign = (state: ICartSlice, action: any) => {
      const { cart, totals } = action.payload;
      state.items = cart?.items || [];
      state.totalCount = totals?.totalQuantity || 0;
      state.totalPrice = totals?.totalPrice || 0;
    };
    builder.addCase(fetchMyCart.fulfilled, assign);
    builder.addCase(addToCart.fulfilled, assign);
    builder.addCase(updateCartItem.fulfilled, assign);
    builder.addCase(removeFromCart.fulfilled, assign);
    builder.addCase(clearCart.fulfilled, assign);
  },
});

export { cartsSlice };
export const cartsSelector = (state: { carts: ICartSlice }) => state.carts;
