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
        // Add application token (X-API-Key) to all requests
        const applicationToken = process.env.REACT_APP_APPLICATION_TOKEN || process.env.REACT_APP_API_KEY;
        if (applicationToken) {
          config.headers['X-API-Key'] = applicationToken;
        }
        
        // Add JWT token (Authorization) if available
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

  private async handleError(error: AxiosError) {
    // Import auto-fix system
    const { autoFix, applyAutoFix } = await import('./autoFix');
    
    // Attempt to auto-fix the error
    const fixResult = await autoFix(error);
    
    // Apply the auto-fix
    applyAutoFix(fixResult);
    
    // If auto-fix didn't handle it, use fallback
    if (!fixResult.fixed && !fixResult.message) {
      if (!error.response) {
        // Network error
        message.error(MESSAGES.ERROR.UNKNOWN_ERROR);
        return;
      }

      const { status, data } = error.response;
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
