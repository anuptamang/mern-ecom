import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  addToWishlistApi,
  removeFromWishlistApi,
  getMyWishlistApi,
  checkWishlistStatusApi,
  getSellerWishlistApi,
} from "services/endPoints/wishlist";
import { IWishlistState, IWishlistItem } from "types/store/wishlist/wishlistTypes";

const initialState: IWishlistState = {
  wishlist: [],
  count: 0,
  status: {
    loading: false,
    error: {
      message: "",
    },
  },
  productWishlistStatus: {},
};

// Fetch user's wishlist
export const fetchMyWishlist = createAsyncThunk<{ wishlist: IWishlistItem[]; count: number }>(
  "wishlist/fetch",
  async () => {
    const response = await getMyWishlistApi();
    return response.data;
  }
);

// Add product to wishlist
export const addToWishlist = createAsyncThunk<string, string>(
  "wishlist/add",
  async (productId) => {
    await addToWishlistApi(productId);
    return productId;
  }
);

// Remove product from wishlist
export const removeFromWishlist = createAsyncThunk<string, string>(
  "wishlist/remove",
  async (productId) => {
    await removeFromWishlistApi(productId);
    return productId;
  }
);

// Check wishlist status for a product
export const checkWishlistStatus = createAsyncThunk<
  { productId: string; isInWishlist: boolean },
  string
>("wishlist/checkStatus", async (productId) => {
  const response = await checkWishlistStatusApi(productId);
  return { productId, isInWishlist: response.data.isInWishlist };
});

// Fetch seller's wishlist (who added their products)
export const fetchSellerWishlist = createAsyncThunk<{ wishlist: IWishlistItem[]; count: number }>(
  "wishlist/fetchSeller",
  async () => {
    const response = await getSellerWishlistApi();
    return response.data;
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearWishlist: (state) => {
      state.wishlist = [];
      state.count = 0;
      state.productWishlistStatus = {};
    },
  },
  extraReducers: (builder) => {
    // Fetch wishlist
    builder
      .addCase(fetchMyWishlist.pending, (state) => {
        state.status.loading = true;
        state.status.error.message = "";
      })
      .addCase(fetchMyWishlist.fulfilled, (state, action) => {
        state.status.loading = false;
        state.wishlist = action.payload.wishlist;
        state.count = action.payload.count;
        // Update product wishlist status cache
        action.payload.wishlist.forEach((item) => {
          const productId = typeof item.productId === "string" 
            ? item.productId 
            : item.productId._id;
          state.productWishlistStatus[productId] = true;
        });
      })
      .addCase(fetchMyWishlist.rejected, (state, action) => {
        state.status.loading = false;
        state.status.error.message =
          action.error.message || "Failed to fetch wishlist";
      });

    // Add to wishlist
    builder
      .addCase(addToWishlist.pending, (state) => {
        state.status.loading = true;
        state.status.error.message = "";
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.status.loading = false;
        state.productWishlistStatus[action.payload] = true;
        // Optionally refresh wishlist
        // You might want to fetch the wishlist again to get the full item
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.status.loading = false;
        state.status.error.message =
          action.error.message || "Failed to add to wishlist";
      });

    // Remove from wishlist
    builder
      .addCase(removeFromWishlist.pending, (state) => {
        state.status.loading = true;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.status.loading = false;
        state.wishlist = state.wishlist.filter(
          (item) => {
            const productId = typeof item.productId === "string" 
              ? item.productId 
              : item.productId?._id;
            return productId !== action.payload;
          }
        );
        state.count = Math.max(0, state.count - 1);
        state.productWishlistStatus[action.payload] = false;
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.status.loading = false;
        state.status.error.message =
          action.error.message || "Failed to remove from wishlist";
      });

    // Check wishlist status
    builder.addCase(checkWishlistStatus.fulfilled, (state, action) => {
      state.productWishlistStatus[action.payload.productId] =
        action.payload.isInWishlist;
    });

    // Fetch seller wishlist
    builder
      .addCase(fetchSellerWishlist.pending, (state) => {
        state.status.loading = true;
      })
      .addCase(fetchSellerWishlist.fulfilled, (state, action) => {
        state.status.loading = false;
        state.wishlist = action.payload.wishlist;
        state.count = action.payload.count;
      })
      .addCase(fetchSellerWishlist.rejected, (state, action) => {
        state.status.loading = false;
        state.status.error.message =
          action.error.message || "Failed to fetch seller wishlist";
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;

