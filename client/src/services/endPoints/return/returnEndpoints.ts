import axios from "axios";
import { BACKEND_API } from "@/configs/api";
import { getToken } from "@/utils/localStorage";

export const RETURN_API = `${BACKEND_API}/returns`;

export const createReturnRequestApi = async (orderId: string, items: any[], reason?: string, proofImages?: File[]) => {
  const token = getToken() || "";
  const formData = new FormData();
  
  formData.append("items", JSON.stringify(items));
  if (reason) {
    formData.append("reason", reason);
  }
  
  // Append proof images
  if (proofImages && proofImages.length > 0) {
    proofImages.forEach((file) => {
      formData.append("proofImages", file);
    });
  }
  
  return axios.post(
    `${RETURN_API}/${orderId}`,
    formData,
    {
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export const getMyReturnsApi = async () => {
  const token = getToken() || "";
  return axios.get(`${RETURN_API}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getReturnRequestApi = async (returnId: string) => {
  const token = getToken() || "";
  return axios.get(`${RETURN_API}/${returnId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const cancelReturnApi = async (returnId: string) => {
  const token = getToken() || "";
  return axios.delete(`${RETURN_API}/${returnId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getSellerReturnsApi = async () => {
  const token = getToken() || "";
  return axios.get(`${RETURN_API}/seller/list`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const approveReturnApi = async (returnId: string) => {
  const token = getToken() || "";
  return axios.post(
    `${RETURN_API}/${returnId}/approve`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const rejectReturnApi = async (returnId: string, reason?: string) => {
  const token = getToken() || "";
  return axios.post(
    `${RETURN_API}/${returnId}/reject`,
    { reason },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

// Re-export workflow endpoints
export * from './returnWorkflowEndpoints';
