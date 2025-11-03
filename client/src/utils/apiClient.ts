/**
 * Centralized API client
 * Provides consistent error handling, request/response interceptors
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { BACKEND_API } from 'configs/api';
import { getToken, removeToken } from './localStorage';
import { message } from 'antd';
import { MESSAGES } from '../constants';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BACKEND_API,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error: AxiosError) => {
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  private handleError(error: AxiosError) {
    if (!error.response) {
      // Network error
      message.error(MESSAGES.ERROR.UNKNOWN_ERROR);
      return;
    }

    const { status, data } = error.response;

    switch (status) {
      case 401:
        // Unauthorized - clear token and redirect to login
        removeToken();
        window.location.href = '/login';
        break;
      case 403:
        message.error('You do not have permission to perform this action');
        break;
      case 404:
        message.error('Resource not found');
        break;
      case 500:
        message.error('Server error. Please try again later');
        break;
      default:
        const errorMessage = (data as any)?.message || MESSAGES.ERROR.UNKNOWN_ERROR;
        message.error(errorMessage);
    }
  }

  public get<T>(url: string, config?: AxiosRequestConfig) {
    return this.client.get<T>(url, config);
  }

  public post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.post<T>(url, data, config);
  }

  public put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.put<T>(url, data, config);
  }

  public patch<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.patch<T>(url, data, config);
  }

  public delete<T>(url: string, config?: AxiosRequestConfig) {
    return this.client.delete<T>(url, config);
  }
}

export default new ApiClient();
