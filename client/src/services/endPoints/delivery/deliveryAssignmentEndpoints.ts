import axios from "axios";
import { BACKEND_API } from "configs/api";
import { getToken } from "utils/localStorage";

// DELIVERY_API is already exported from deliveryEndpoints.ts, so we don't export it again

import { DELIVERY_API } from './deliveryEndpoints';

export const assignToDeliveryAgencyApi = async (orderId: string, deliveryAgencyId: string) => {
  const token = getToken() || "";
  return axios.post(
    `${DELIVERY_API}/${orderId}/assign-agency`,
    { deliveryAgencyId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const assignToDeliveryPersonApi = async (orderId: string, deliveryPersonId: string) => {
  const token = getToken() || "";
  return axios.post(
    `${DELIVERY_API}/${orderId}/assign-person`,
    { deliveryPersonId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const markAsDeliveredApi = async (orderId: string, note?: string, deliveryProof?: File) => {
  const token = getToken() || "";
  const formData = new FormData();
  if (note) formData.append("note", note);
  if (deliveryProof) formData.append("deliveryProof", deliveryProof);

  return axios.post(
    `${DELIVERY_API}/${orderId}/delivered`,
    formData,
    {
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export const acceptDeliveryApi = async (orderId: string, reason?: string, orderItemId?: string, productId?: string) => {
  const token = getToken() || "";
  return axios.post(
    `${DELIVERY_API}/${orderId}/accept`,
    { reason, orderItemId, productId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const rejectDeliveryApi = async (orderId: string, reason: string, orderItemId?: string, productId?: string) => {
  const token = getToken() || "";
  return axios.post(
    `${DELIVERY_API}/${orderId}/reject`,
    { reason, orderItemId, productId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const getAgencyDeliveriesApi = async () => {
  const token = getToken() || "";
  return axios.get(`${DELIVERY_API}/agency/list`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getPersonDeliveriesApi = async () => {
  const token = getToken() || "";
  return axios.get(`${DELIVERY_API}/person/list`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getAgencyPersonsApi = async (agencyId?: string) => {
  const token = getToken() || "";
  const url = agencyId 
    ? `${DELIVERY_API}/agency/${agencyId}/persons`
    : `${DELIVERY_API}/agency/persons`;
  return axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const createDeliveryPersonApi = async (email: string, password: string, fullName: string, phone?: string) => {
  const token = getToken() || "";
  return axios.post(
    `${DELIVERY_API}/agency/persons`,
    { email, password, fullName, phone },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};
