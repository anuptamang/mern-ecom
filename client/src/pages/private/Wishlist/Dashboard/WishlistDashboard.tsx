import { Card, List, Image, Button, Empty, Spin, message, Space } from "antd";
import { useAppDispatch, useAppSelector } from "redux/store";
import { authSelector } from "redux/slice";
import {
  fetchMyWishlist,
  removeFromWishlist,
} from "redux/slice/wishlist/wishlistSlice";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProductImagePlaceholder } from "components/ProductImageGallery/ProductImagePlaceholder";
import { DeleteOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { addToCart, fetchMyCart } from "redux/slice/carts/cartsSlice";
import "./WishlistDashboard.scss";

export const WishlistDashboard = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { wishlist, count, status } = useAppSelector((state) => state.wishlist);
  const { result } = useAppSelector(authSelector);

  useEffect(() => {
    if (result?._id) {
      dispatch(fetchMyWishlist());
    }
  }, [result?._id, dispatch]);

  const handleRemoveFromWishlist = async (productId: string, productTitle: string) => {
    try {
      await dispatch(removeFromWishlist(productId)).unwrap();
      message.success(`${productTitle} removed from wishlist`);
    } catch (error: any) {
      message.error(error?.message || "Failed to remove from wishlist");
    }
  };

  const handleAddToCart = async (productId: string, title: string, stock: number) => {
    if (stock <= 0) {
      message.error("Product is out of stock");
      return;
    }

    try {
      await dispatch(addToCart({ productId })).unwrap();
      message.success(`${title} added to cart`);
      dispatch(fetchMyCart());
    } catch (error: any) {
      message.error(error?.message || "Failed to add product to cart");
    }
  };

  if (status.loading) {
    return (
      <div className="wishlist-dashboard">
        <Card title="My Wishlist">
          <div style={{ textAlign: "center", padding: "50px 0" }}>
            <Spin size="large" tip="Loading wishlist..." />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="wishlist-dashboard">
      <Card
        title={`My Wishlist (${count})`}
        className="wishlist-card"
      >
        {wishlist.length === 0 ? (
          <Empty
            description="Your wishlist is empty"
            style={{ padding: "50px 0" }}
          >
            <Button type="primary" onClick={() => navigate("/")}>
              Browse Products
            </Button>
          </Empty>
        ) : (
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 4, lg: 4, xl: 4, xxl: 4 }}
            dataSource={wishlist}
            renderItem={(item: any) => {
              const product = item.productId;
              if (!product) return null;

              const productId = typeof product === "string" ? product : product._id;
              const title = typeof product === "object" ? product.title : "Product";
              const thumbnail = typeof product === "object" ? product.thumbnail : null;
              const price = typeof product === "object" ? product.price : null;
              const stock = typeof product === "object" ? product.stock : 0;

              return (
                <List.Item>
                  <Card
                    className="wishlist-product-card"
                    cover={
                      thumbnail ? (
                        <div
                          className="product-image-wrapper"
                          onClick={() => navigate(`/products/${productId}`)}
                        >
                          <Image
                            alt={title}
                            src={thumbnail}
                            preview={false}
                            className="product-image"
                          />
                        </div>
                      ) : (
                        <div
                          className="product-image-wrapper"
                          onClick={() => navigate(`/products/${productId}`)}
                        >
                          <ProductImagePlaceholder title={title} />
                        </div>
                      )
                    }
                    actions={[
                      <Button
                        key="view"
                        type="link"
                        onClick={() => navigate(`/products/${productId}`)}
                      >
                        View
                      </Button>,
                      <Space key="actions" style={{ width: "100%", justifyContent: "center" }}>
                        <Button
                          type="primary"
                          size="small"
                          icon={<ShoppingCartOutlined />}
                          disabled={stock <= 0}
                          onClick={() => handleAddToCart(productId, title, stock)}
                        >
                          {stock > 0 ? "Add to Cart" : "Out of Stock"}
                        </Button>
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemoveFromWishlist(productId, title)}
                        />
                      </Space>,
                    ]}
                    hoverable
                  >
                    <Card.Meta
                      title={
                        <div
                          onClick={() => navigate(`/products/${productId}`)}
                          style={{ cursor: "pointer" }}
                        >
                          {title}
                        </div>
                      }
                      description={
                        <div className="wishlist-product-meta">
                          {price && (
                            <div className="product-price">${price.toFixed(2)}</div>
                          )}
                          <div className="product-stock">
                            {stock !== undefined ? (
                              <span className={stock > 0 ? "stock-available" : "stock-out"}>
                                {stock > 0 ? `In Stock (${stock})` : "Out of Stock"}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </List.Item>
              );
            }}
          />
        )}
      </Card>
    </div>
  );
};

