import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { IProductsFilterSlice } from "types/store/productsFilterSliceTypes"

const initialState: IProductsFilterSlice = {
  category: '',
}

const productsFilterSlice = createSlice({
  name: 'productsFilter',
  initialState,
  reducers: {
    setCategory: (state, action: PayloadAction<string>) => {
      state.category = action.payload
    }
  }
})

export { productsFilterSlice }
export const { setCategory } = productsFilterSlice.actions
export const productsFilterSelector = (state: { productsFilter: IProductsFilterSlice }) => state.productsFilter
