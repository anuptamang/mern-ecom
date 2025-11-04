import { HeartOutlined, HeartFilled } from "@ant-design/icons";
import { Button, Tooltip, message } from "antd";
import { useAppDispatch, useAppSelector } from "redux/store";
import {
  addToWishlist,
  removeFromWishlist,
  checkWishlistStatus,
  fetchMyWishlist,
} from "redux/slice/wishlist/wishlistSlice";
import { useEffect, useState } from "react";
import { authSelector } from "redux/slice";
import "./WishlistButton.scss";

interface WishlistButtonProps {
  productId: string;
  productTitle?: string;
  size?: "small" | "middle" | "large";
  className?: string;
}

export const WishlistButton = ({
  productId,
  productTitle = "Product",
  size = "middle",
  className = "",
}: WishlistButtonProps) => {
  const dispatch = useAppDispatch();
  const { result } = useAppSelector(authSelector);
  const { productWishlistStatus } = useAppSelector((state) => state.wishlist);
  const [loading, setLoading] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  // Check wishlist status on mount
  useEffect(() => {
    if (result?._id && productId) {
      // Check cache first
      if (productWishlistStatus[productId] !== undefined) {
        setIsInWishlist(productWishlistStatus[productId]);
      } else {
        // Fetch from server
        dispatch(checkWishlistStatus(productId)).then((action: any) => {
          if (checkWishlistStatus.fulfilled.match(action)) {
            setIsInWishlist(action.payload.isInWishlist);
          }
        });
      }
    }
  }, [productId, result?._id, dispatch, productWishlistStatus]);

  const handleToggleWishlist = async () => {
    if (!result?._id) {
      message.warning("Please log in to add items to wishlist");
      return;
    }

    setLoading(true);
    try {
      if (isInWishlist) {
        await dispatch(removeFromWishlist(productId)).unwrap();
        setIsInWishlist(false);
        message.success(`${productTitle} removed from wishlist`);
      } else {
        await dispatch(addToWishlist(productId)).unwrap();
        setIsInWishlist(true);
        message.success(`${productTitle} added to wishlist`);
        // Refresh wishlist to get full item
        dispatch(fetchMyWishlist());
      }
    } catch (error: any) {
      message.error(error?.message || "Failed to update wishlist");
    } finally {
      setLoading(false);
    }
  };

  if (!result?._id || result?.role === "seller") {
    return null; // Don't show for sellers or unauthenticated users
  }

  return (
    <Tooltip title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}>
      <Button
        type="text"
        icon={isInWishlist ? <HeartFilled style={{ color: "var(--theme-error, #ff4d4f)" }} /> : <HeartOutlined />}
        onClick={handleToggleWishlist}
        loading={loading}
        size={size}
        className={`wishlist-button ${className}`}
      />
    </Tooltip>
  );
};
