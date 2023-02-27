import { createAsyncThunk } from "@reduxjs/toolkit";
import { loginApi, registerApi } from "services/endPoints/auth/authEndpoints";
import { IAuthSlice, ILogin, IRegister } from "types/store/auth/authSliceTypes";

export const login = createAsyncThunk<IAuthSlice, ILogin>("auth/login", async (payload) => {
  const response = await loginApi(payload);
  return response.data
})

export const register = createAsyncThunk<IAuthSlice, IRegister>("auth/register", async (payload) => {
  const response = await registerApi(payload);
  return response.data
})