import axios from "axios";
import { BACKEND_API } from "@/configs/api";
import { getToken } from "@/utils/localStorage";

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

export const assignToDeliveryPersonApi = async (orderId: string, deliveryPersonId: string, orderItemId?: string, productId?: string) => {
  const token = getToken() || "";
  return axios.post(
    `${DELIVERY_API}/${orderId}/assign-person`,
    { deliveryPersonId, orderItemId, productId },
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

// Buyer accept/reject delivery APIs removed - now handled by customer deliverer with proof upload

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

export const getWarehouseOperatorDeliveriesApi = async () => {
  const token = getToken() || "";
  return axios.get(`${DELIVERY_API}/warehouse-operator/list`, {
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

export const getWarehouseOperatorsApi = async () => {
  const token = getToken() || "";
  return axios.get(`${DELIVERY_API}/warehouse-operators`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const assignWarehouseOperatorApi = async (
  orderId: string,
  warehouseOperatorId: string,
  orderItemId?: string,
  productId?: string
) => {
  const token = getToken() || "";
  return axios.post(
    `${DELIVERY_API}/${orderId}/assign-warehouse-operator`,
    { warehouseOperatorId, orderItemId, productId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const createDeliveryPersonApi = async (email: string, password: string, fullName: string, delivererType: 'warehouse' | 'customer_delivery' | 'customer_return', phone?: string) => {
  const token = getToken() || "";
  return axios.post(
    `${DELIVERY_API}/agency/persons`,
    { email, password, fullName, phone, delivererType },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

// Reassign endpoints
export const reassignDeliveryAgencyApi = async (
  orderId: string,
  newAgencyId: string,
  orderItemId?: string,
  productId?: string,
  reason?: string
) => {
  const token = getToken() || "";
  return axios.post(
    `${DELIVERY_API}/${orderId}/reassign-agency`,
    { newAgencyId, orderItemId, productId, reason },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const reassignDeliveryPersonApi = async (
  orderId: string,
  newPersonId: string,
  orderItemId?: string,
  productId?: string,
  reason?: string
) => {
  const token = getToken() || "";
  return axios.post(
    `${DELIVERY_API}/${orderId}/reassign-person`,
    { newPersonId, orderItemId, productId, reason },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const reassignWarehouseOperatorApi = async (
  orderId: string,
  newOperatorId: string,
  orderItemId?: string,
  productId?: string,
  reason?: string
) => {
  const token = getToken() || "";
  return axios.post(
    `${DELIVERY_API}/${orderId}/reassign-warehouse-operator`,
    { newOperatorId, orderItemId, productId, reason },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

// Reject assignment endpoint
export const rejectDeliveryAssignmentApi = async (
  orderId: string,
  rejectionReason: string,
  assignmentType: 'agency' | 'deliverer' | 'warehouse_operator',
  orderItemId?: string,
  productId?: string
) => {
  const token = getToken() || "";
  return axios.post(
    `${DELIVERY_API}/${orderId}/reject-assignment`,
    { rejectionReason, assignmentType, orderItemId, productId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};
