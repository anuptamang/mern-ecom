import axios, { AxiosResponse } from "axios"
import { AUTH_API } from "services/servicesConstants"
import { ILogin, IRegister } from "types/store/auth/authSliceTypes"


export const loginApi = async (payload: ILogin): Promise<AxiosResponse> => {
  try {
    const response = await axios.post(`${AUTH_API}/login`, payload);
    if (response.status !== 200) {
      throw new Error(`HTTP Error: ${response}`);
    }
    return response;
  } catch (error: unknown | any) {
    throw error.response;
  }
};


export const registerApi = async (payload: IRegister): Promise<AxiosResponse> => {
  try {
    const response = await axios.post(`${AUTH_API}/register`, payload);
    if (response.status !== 200) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    return response;
  } catch (error: unknown | any) {
    throw error.response;
  }
}

export const checkUserApi = async (payload: ILogin): Promise<AxiosResponse> => {
  try {
    const response = await axios.post(`${AUTH_API}/check-user`, payload);
    if (response.status !== 200) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    // console.log(response, 'api')

    return response;
  } catch (error: unknown | any) {
    throw error.response;
  }
}

export const forgotPasswordApi = async (payload: ILogin): Promise<AxiosResponse> => {
  try {
    const response = await axios.put(`${AUTH_API}/change-password`, payload);
    if (response.status !== 200) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    return response;
  } catch (error: unknown | any) {
    throw error.response;
  }
}