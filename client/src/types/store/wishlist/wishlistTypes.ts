export interface IWishlistItem {
  _id: string;
  userId: string;
  productId: any; // Can be populated Product object or string ID
  addedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface IWishlistState {
  wishlist: IWishlistItem[];
  count: number;
  status: {
    loading: boolean;
    error: {
      message: string;
    };
  };
  productWishlistStatus: Record<string, boolean>; // Cache for product wishlist status
}

