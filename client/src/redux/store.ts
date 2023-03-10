import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, TypedUseSelectorHook, useSelector } from 'react-redux'
import { productsFilterSlice, productsSlice, authSlice } from './slice';
import { loadState } from 'utils';

const store = configureStore({
  reducer: {
    products: productsSlice.reducer,
    productsFilter: productsFilterSlice.reducer,
    auth: authSlice.reducer,
  },
  preloadedState: loadState('user'),
})

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export const useAppDispatch: () => AppDispatch = useDispatch // Export a hook that can be reused to resolve types
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; // Export a hook that can be reused to resolve types

export default store