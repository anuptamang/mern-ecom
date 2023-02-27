import { createSlice } from "@reduxjs/toolkit";
import { login, register } from "redux/action/auth/authAction";
import { IAuthSlice } from "types/store/auth/authSliceTypes";

const initialState: IAuthSlice = {
  result: {},
  token: '',
  status: {
    loading: false,
    error: { message: '' },
    success: false,
  }
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signOut: () => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(login.pending, (state) => {
      state.status.loading = true;
    })
    builder.addCase(login.fulfilled, (state, action) => {
      state.status.loading = false;
      state.result = action.payload.result;
      state.token = action.payload.token;
      state.status.success = true;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.status.loading = false;
      state.status.error.message = action.error.message;
    });
    builder.addCase(register.pending, (state) => {
      state.status.loading = true;
    })
    builder.addCase(register.fulfilled, (state, action) => {
      state.status.loading = false;
      state.result = action.payload.result;
      state.token = action.payload.token;
      state.status.success = true;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.status.loading = false;
      state.status.error.message = action.error.message;
    });
  }
})

export const { signOut } = authSlice.actions;

export const authSelector = (state: { auth: IAuthSlice }) => state.auth;