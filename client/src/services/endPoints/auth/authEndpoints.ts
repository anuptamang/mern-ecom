import axios, { AxiosResponse } from "axios"
import { AUTH_API } from "services/servicesConstants"
import { ILogin, IRegister } from "types/store/auth/authSliceTypes"

export const loginApi = async (payload: ILogin): Promise<AxiosResponse> => {
  return axios.post(
    `${AUTH_API}/login`, payload
  )
}

export const registerApi = async (payload: IRegister): Promise<AxiosResponse> => {
  return axios.post(
    `${AUTH_API}/registration`, payload
  )
}