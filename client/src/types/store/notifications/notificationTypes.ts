export type NotificationType =
  | "comment"
  | "rating"
  | "review"
  | "reply"
  | "order"
  | "order_cancelled"
  | "cart_update"
  | "product_update"
  | "system"
  | "chat";

export type EntityType = "product" | "order" | "comment" | "rating" | "user" | "chat";

export interface IRelatedEntity {
  entityType: EntityType;
  entityId: string;
}

export interface INotificationMetadata {
  productId?: string;
  productTitle?: string;
  orderId?: string;
  commentId?: string;
  rating?: number;
  commenterId?: string;
  commenterName?: string;
  raterId?: string;
  raterName?: string;
  replierId?: string;
  replierName?: string;
  commentText?: string;
  review?: string;
  replyText?: string;
  [key: string]: any;
}

export interface INotification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntity?: IRelatedEntity;
  read: boolean;
  readAt?: string;
  actionUrl?: string;
  metadata?: INotificationMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface INotificationState {
  notifications: INotification[];
  unreadCount: number;
  total: number;
  status: {
    loading: boolean;
    error: {
      message: string;
    };
  };
}

