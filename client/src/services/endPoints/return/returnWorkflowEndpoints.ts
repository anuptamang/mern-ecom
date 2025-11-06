import axios from "axios";
import { BACKEND_API } from "@/configs/api";
import { getToken } from "@/utils/localStorage";

export const RETURN_API = `${BACKEND_API}/returns`;

// Support team endpoints
export const getSupportReturnsApi = async () => {
  const token = getToken() || "";
  return axios.get(`${RETURN_API}/support/list`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Delivery agency endpoints (return assignments)
export const getAgencyReturnsApi = async () => {
  const token = getToken() || "";
  return axios.get(`${RETURN_API}/agency/list`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const assignSupportUserApi = async (returnId: string, supportUserId: string) => {
  const token = getToken() || "";
  return axios.post(
    `${RETURN_API}/${returnId}/assign-support`,
    { supportUserId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

// Support user endpoints
export const assignReturnDeliveryAgencyApi = async (returnId: string, agencyId: string) => {
  const token = getToken() || "";
  return axios.post(
    `${RETURN_API}/${returnId}/assign-agency`,
    { agencyId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const assignVerificationTeamApi = async (returnId: string, verificationTeamId: string) => {
  const token = getToken() || "";
  return axios.post(
    `${RETURN_API}/${returnId}/assign-verification`,
    { verificationTeamId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const assignFinanceApi = async (returnId: string, financeId: string) => {
  const token = getToken() || "";
  return axios.post(
    `${RETURN_API}/${returnId}/assign-finance`,
    { financeId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const assignRedeliveryAgencyApi = async (returnId: string, agencyId: string) => {
  const token = getToken() || "";
  return axios.post(
    `${RETURN_API}/${returnId}/assign-redelivery`,
    { agencyId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

// Delivery agency endpoints (return pickup)
export const assignReturnDelivererApi = async (returnId: string, delivererId: string) => {
  const token = getToken() || "";
  return axios.post(
    `${RETURN_API}/${returnId}/assign-deliverer`,
    { delivererId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

// Return deliverer endpoints
export const getReturnDelivererReturnsApi = async () => {
  const token = getToken() || "";
  return axios.get(`${RETURN_API}/deliverer/list`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const markReturnPickedUpApi = async (returnId: string, note?: string, pickupProof?: File) => {
  const token = getToken() || "";
  const formData = new FormData();
  if (note) formData.append("note", note);
  if (pickupProof) formData.append("pickupProof", pickupProof);

  return axios.post(
    `${RETURN_API}/${returnId}/picked-up`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export const markReturnDeliveredApi = async (returnId: string, note?: string) => {
  const token = getToken() || "";
  return axios.post(
    `${RETURN_API}/${returnId}/delivered`,
    { note },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const submitToSupportApi = async (returnId: string, note?: string) => {
  const token = getToken() || "";
  return axios.post(
    `${RETURN_API}/${returnId}/submit-to-support`,
    { note },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

// Verification team endpoints
export const getVerificationTeamReturnsApi = async () => {
  const token = getToken() || "";
  return axios.get(`${RETURN_API}/verification/list`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const assignReturnInspectorApi = async (returnId: string, inspectorId: string) => {
  const token = getToken() || "";
  return axios.post(
    `${RETURN_API}/${returnId}/assign-inspector`,
    { inspectorId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

// Inspector endpoints
export const getInspectorReturnsApi = async () => {
  const token = getToken() || "";
  return axios.get(`${RETURN_API}/inspector/list`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const inspectReturnApi = async (
  returnId: string,
  result: "accepted" | "rejected",
  note?: string,
  rejectionReason?: string
) => {
  const token = getToken() || "";
  return axios.post(
    `${RETURN_API}/${returnId}/inspect`,
    { result, note, rejectionReason },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

// Finance endpoints
export const getFinanceReturnsApi = async () => {
  const token = getToken() || "";
  return axios.get(`${RETURN_API}/finance/list`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const processRefundApi = async (returnId: string) => {
  const token = getToken() || "";
  return axios.post(
    `${RETURN_API}/${returnId}/process-refund`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

// Reassign endpoints
export const reassignSupportUserApi = async (returnId: string, newSupportUserId: string, reason?: string) => {
  const token = getToken() || "";
  return axios.post(
    `${RETURN_API}/${returnId}/reassign-support`,
    { newSupportUserId, reason },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const reassignReturnDeliveryAgencyApi = async (returnId: string, newAgencyId: string, reason?: string) => {
  const token = getToken() || "";
  return axios.post(
    `${RETURN_API}/${returnId}/reassign-agency`,
    { newAgencyId, reason },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const reassignReturnDelivererApi = async (returnId: string, newDelivererId: string, reason?: string) => {
  const token = getToken() || "";
  return axios.post(
    `${RETURN_API}/${returnId}/reassign-deliverer`,
    { newDelivererId, reason },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const reassignVerificationTeamApi = async (returnId: string, newTeamId: string, reason?: string) => {
  const token = getToken() || "";
  return axios.post(
    `${RETURN_API}/${returnId}/reassign-verification`,
    { newTeamId, reason },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const reassignInspectorApi = async (returnId: string, newInspectorId: string, reason?: string) => {
  const token = getToken() || "";
  return axios.post(
    `${RETURN_API}/${returnId}/reassign-inspector`,
    { newInspectorId, reason },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const reassignFinanceApi = async (returnId: string, newFinanceId: string, reason?: string) => {
  const token = getToken() || "";
  return axios.post(
    `${RETURN_API}/${returnId}/reassign-finance`,
    { newFinanceId, reason },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

// Reject assignment endpoint
export const rejectReturnAssignmentApi = async (
  returnId: string,
  rejectionReason: string,
  assignmentType: 'support' | 'agency' | 'deliverer' | 'verification' | 'inspector' | 'finance'
) => {
  const token = getToken() || "";
  return axios.post(
    `${RETURN_API}/${returnId}/reject-assignment`,
    { rejectionReason, assignmentType },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};
