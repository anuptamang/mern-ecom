export type DeliveryStatus =
  | "packing"
  | "ready_to_ship"
  | "picked_up"
  | "in_facility"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export interface IStatusHistory {
  status: string;
  timestamp: string;
  note?: string;
}

export interface IDeliveryTracking {
  _id: string;
  orderId: string;
  status: DeliveryStatus;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  trackingNumber?: string;
  carrier?: string;
  deliveryAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    addressType?: "primary" | "secondary";
  };
  statusHistory: IStatusHistory[];
  createdAt: string;
  updatedAt: string;
}

