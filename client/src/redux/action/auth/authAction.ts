import { createAsyncThunk } from "@reduxjs/toolkit";
import { checkUserApi, forgotPasswordApi, loginApi, registerApi } from "services/endPoints/auth/authEndpoints";
import { getUserApi, updateUserApi } from "services/endPoints/user/userEndpoints";
import { getToken } from "utils/localStorage";
import { IAuthSlice, ILogin, IRegister } from "types/store/auth/authSliceTypes";

export type TError = {
  message: string;
}

export const login = createAsyncThunk<IAuthSlice, ILogin, { rejectValue: TError }>("auth/login", async (payload, thunkApi) => {
  try {
    const response = await loginApi(payload);
    return response.data;
  } catch (error: unknown | any) {
    // Handle axios error response structure
    const errorData = error?.data || error?.response?.data;
    const errorMessage = errorData?.message || error?.message || 'Login failed. Please check your credentials.';
    return thunkApi.rejectWithValue({
      message: errorMessage
    });
  }
});

export const register = createAsyncThunk<IAuthSlice, IRegister, { rejectValue: TError }>("auth/register", async (payload, thunkApi) => {
  try {
    const response = await registerApi(payload);
    return response.data;
  } catch (error: unknown | any) {
    // Handle axios error response structure
    const errorData = error?.data || error?.response?.data;
    const errorMessage = errorData?.message || error?.message || 'Registration failed. Please try again.';
    return thunkApi.rejectWithValue({
      message: errorMessage
    });
  }
});


export const validateUser = createAsyncThunk<IAuthSlice, ILogin, { rejectValue: TError }>("auth/validate-user", async (payload, thunkApi) => {
  try {
    const response = await checkUserApi(payload);
    return response.data;
  } catch (error: unknown | any) {
    // Handle axios error response structure
    const errorData = error?.data || error?.response?.data;
    const errorMessage = errorData?.message || error?.message || 'Validation failed. Please try again.';
    return thunkApi.rejectWithValue({
      message: errorMessage
    });
  }
});

export const changePassword = createAsyncThunk<IAuthSlice, ILogin, { rejectValue: TError }>("auth/forgot-password", async (payload, thunkApi) => {
  try {
    const response = await forgotPasswordApi(payload);
    return response.data;
  } catch (error: unknown | any) {
    // Handle axios error response structure
    const errorData = error?.data || error?.response?.data;
    const errorMessage = errorData?.message || error?.message || 'Password change failed. Please try again.';
    return thunkApi.rejectWithValue({
      message: errorMessage
    });
  }
});

export const fetchUserProfile = createAsyncThunk<any, { id: string }>("auth/fetch-user-profile", async ({ id }) => {
  const token = getToken() || '';
  const response = await getUserApi(token, id);
  return response.data;
});

export const updateUserProfileThunk = createAsyncThunk<any, { id: string, data: any }, { rejectValue: TError }>("auth/update-user-profile", async ({ id, data }, thunkApi) => {
  try {
    const token = getToken() || '';
    if (!token) {
      return thunkApi.rejectWithValue({ message: "Authentication required" });
    }
    const response = await updateUserApi(token, id, data);
    return response.data;
  } catch (error: unknown | any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Failed to update profile";
    return thunkApi.rejectWithValue({ message: errorMessage });
  }
});