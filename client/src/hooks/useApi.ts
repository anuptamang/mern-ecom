/**
 * Custom hook for API calls with loading and error states
 * Provides consistent API interaction pattern
 */

import { useState, useCallback } from 'react';
import apiClient from '../utils/apiClient';
import { message } from 'antd';
import { MESSAGES } from '../../constants';

interface UseApiOptions {
  showSuccessMessage?: boolean;
  successMessage?: string;
  showErrorMessage?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useApi = <T = any>(options: UseApiOptions = {}) => {
  const {
    showSuccessMessage = false,
    successMessage,
    showErrorMessage = true,
    onSuccess,
    onError,
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(
    async (apiCall: () => Promise<any>) => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiCall();
        const result = response.data;

        setData(result);

        if (showSuccessMessage) {
          message.success(successMessage || MESSAGES.SUCCESS.WELCOME_BACK);
        }

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err: any) {
        setError(err);
        
        if (showErrorMessage && err.response?.status !== 401) {
          const errorMessage = err.response?.data?.message || MESSAGES.ERROR.UNKNOWN_ERROR;
          message.error(errorMessage);
        }

        if (onError) {
          onError(err);
        }

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [showSuccessMessage, successMessage, showErrorMessage, onSuccess, onError]
  );

  return { execute, loading, error, data };
};
