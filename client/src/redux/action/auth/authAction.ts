import { createAsyncThunk } from "@reduxjs/toolkit";
import { checkUserApi, forgotPasswordApi, loginApi, registerApi } from "services/endPoints/auth/authEndpoints";
import { IAuthSlice, ILogin, IRegister } from "types/store/auth/authSliceTypes";

export type TError = {
  message: string;
}

export const login = createAsyncThunk<IAuthSlice, ILogin, { rejectValue: TError }>("auth/login", async (payload, thunkApi) => {
  try {
    const response = await loginApi(payload);
    return response.data;
  } catch (error: unknown | any) {
    return thunkApi.rejectWithValue(
      error.data
    );
  }
});

export const register = createAsyncThunk<IAuthSlice, IRegister, { rejectValue: TError }>("auth/register", async (payload, thunkApi) => {
  try {
    const response = await registerApi(payload);

    return response.data

  } catch (error: unknown | any) {
    return thunkApi.rejectWithValue(
      error.data
    );
  }
})


export const validateUser = createAsyncThunk<IAuthSlice, ILogin, { rejectValue: TError }>("auth/validate-user", async (payload, thunkApi) => {
  try {
    const response = await checkUserApi(payload);
    return response.data;
  } catch (error: unknown | any) {

    return thunkApi.rejectWithValue(
      error.data
    );
  }
});

export const changePassword = createAsyncThunk<IAuthSlice, ILogin, { rejectValue: TError }>("auth/forgot-password", async (payload, thunkApi) => {
  try {
    const response = await forgotPasswordApi(payload);
    return response.data;
  } catch (error: unknown | any) {

    return thunkApi.rejectWithValue(
      error.data
    );
  }
});