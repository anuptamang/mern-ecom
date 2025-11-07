import axios from "axios";
import { BACKEND_API } from "configs/api";
import { getToken } from "utils/localStorage";

export const PAYOUT_API = `${BACKEND_API}/payouts`;

export interface IPayout {
  _id: string;
  orderId: any;
  orderItemId: string;
  productId: any;
  sellerId: any;
  deliveryId: any;
  payoutAmount: number;
  currency: string;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  bankPayout?: {
    accountHolderName?: string;
    accountNumber?: string;
    bankName?: string;
    routingNumber?: string;
    swiftCode?: string;
    iban?: string;
    accountType?: "checking" | "savings";
  };
  processedBy?: any;
  processedAt?: Date;
  transferId?: string;
  failureReason?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const getPendingPayoutsApi = async (): Promise<{ payouts: IPayout[]; count: number }> => {
  const token = getToken() || "";
  const { data } = await axios.get(`${PAYOUT_API}/pending`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const getPayoutsApi = async (status?: string): Promise<{ payouts: IPayout[]; count: number }> => {
  const token = getToken() || "";
  const { data } = await axios.get(`${PAYOUT_API}`, {
    params: status ? { status } : undefined,
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const getPayoutApi = async (payoutId: string): Promise<{ payout: IPayout }> => {
  const token = getToken() || "";
  const { data } = await axios.get(`${PAYOUT_API}/${payoutId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const processPayoutApi = async (payoutId: string, notes?: string): Promise<{ payout: IPayout; message: string }> => {
  const token = getToken() || "";
  const { data } = await axios.post(
    `${PAYOUT_API}/${payoutId}/process`,
    { notes },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return data;
};

export const cancelPayoutApi = async (payoutId: string, reason?: string): Promise<{ payout: IPayout; message: string }> => {
  const token = getToken() || "";
  const { data } = await axios.post(
    `${PAYOUT_API}/${payoutId}/cancel`,
    { reason },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return data;
};
