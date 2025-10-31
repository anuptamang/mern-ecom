import { useState, useEffect } from 'react';
import { Rate, Button, Input, Card, Avatar, message, Spin } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import axios from 'axios';
import { getToken } from 'utils/localStorage';
import { PRODUCTS_API } from 'services/servicesConstants';
import { authSelector } from 'redux/slice';
import { useAppSelector } from 'redux/store';

const { TextArea } = Input;

type ProductRatingsProps = {
  productId: string;
  productRating?: number;
};

type RatingItem = {
  _id?: string;
  userId?: {
    _id?: string;
    fullName?: string;
    profilePhoto?: string;
  } | string; // Can be populated object or just ObjectId string
  rating: number;
  review: string;
  createdAt: string;
};

export const ProductRatings = ({ productId, productRating = 0 }: ProductRatingsProps) => {
  const { result } = useAppSelector(authSelector);
  const [ratings, setRatings] = useState<RatingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    fetchRatings();
  }, [productId]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${PRODUCTS_API}/${productId}/ratings`);
      setRatings(response.data);
      
      // Find user's existing rating
      if (result?._id) {
        const userRatingItem = response.data.find((r: RatingItem) => {
          const userIdValue = typeof r.userId === 'object' && r.userId !== null
            ? (r.userId._id || r.userId)
            : r.userId;
          return String(userIdValue) === String(result._id);
        });
        if (userRatingItem) {
          setUserRating(userRatingItem.rating);
          setUserReview(userRatingItem.review || '');
          setShowReviewForm(true);
        }
      }
    } catch (error: any) {
      message.error('Failed to load ratings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!result) {
      message.warning('Please log in to rate this product');
      return;
    }

    if (userRating === 0) {
      message.warning('Please select a rating');
      return;
    }

    try {
      setSubmitting(true);
      const token = getToken() || '';
      await axios.post(
        `${PRODUCTS_API}/${productId}/ratings`,
        { rating: userRating, review: userReview },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success('Rating submitted successfully');
      setUserReview('');
      setShowReviewForm(false);
      fetchRatings();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : productRating;

  return (
    <Card title="Ratings & Reviews" className="product-ratings">
      <div className="rating-summary">
        <div className="rating-display">
          <div className="rating-value">{averageRating.toFixed(1)}</div>
          <Rate disabled value={averageRating} allowHalf />
          <div className="rating-count">({ratings.length} {ratings.length === 1 ? 'review' : 'reviews'})</div>
        </div>
      </div>

      {result && !showReviewForm && (
        <div className="add-rating-section">
          <Button type="primary" onClick={() => setShowReviewForm(true)}>
            Write a Review
          </Button>
        </div>
      )}

      {showReviewForm && result && (
        <Card className="rating-form-card" title="Your Review">
          <div className="rating-input">
            <span className="label">Rating:</span>
            <Rate value={userRating} onChange={setUserRating} />
          </div>
          <div className="review-input">
            <TextArea
              rows={4}
              placeholder="Write your review..."
              value={userReview}
              onChange={(e) => setUserReview(e.target.value)}
            />
          </div>
          <div className="form-actions">
            <Button onClick={() => setShowReviewForm(false)}>Cancel</Button>
            <Button type="primary" loading={submitting} onClick={handleSubmitRating}>
              Submit Review
            </Button>
          </div>
        </Card>
      )}

      <div className="ratings-list">
        <Spin spinning={loading}>
          {ratings.length === 0 ? (
            <div className="no-ratings">No reviews yet. Be the first to review!</div>
          ) : (
            ratings.map((rating, index) => {
              const userIdObj = typeof rating.userId === 'object' && rating.userId !== null
                ? rating.userId
                : null;
              return (
                <div key={rating._id || index} className="rating-item">
                  <div className="rating-header">
                    <Avatar
                      src={userIdObj?.profilePhoto}
                      icon={<UserOutlined />}
                      size={40}
                    />
                    <div className="rating-info">
                      <div className="user-name">
                        {userIdObj?.fullName || 'Anonymous'}
                      </div>
                      <Rate disabled value={rating.rating} allowHalf />
                      <div className="rating-date">
                        {new Date(rating.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  {rating.review && (
                    <div className="rating-review">{rating.review}</div>
                  )}
                </div>
              );
            })
          )}
        </Spin>
      </div>
    </Card>
  );
};
