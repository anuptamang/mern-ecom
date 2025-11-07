import { useState, useEffect } from 'react';
import { Input, Button, Card, Avatar, message, Spin } from 'antd';
import { UserOutlined, LikeOutlined, CommentOutlined } from '@ant-design/icons';
import axios from 'axios';
import { getToken } from 'utils/localStorage';
import { PRODUCTS_API } from 'services/servicesConstants';
import { replyToCommentApi } from 'services/endPoints/products/productsEndpoints';
import { authSelector } from 'redux/slice';
import { useAppSelector } from 'redux/store';
import { useNavigate } from 'react-router-dom';

const { TextArea } = Input;

type ProductCommentsProps = {
  productId: string;
};

type CommentItem = {
  _id?: string;
  userId?: {
    fullName?: string;
    profilePhoto?: string;
  } | string;
  text: string;
  likes: number;
  replies?: string[];
  createdAt?: string;
};

export const ProductComments = ({ productId }: ProductCommentsProps) => {
  const { result } = useAppSelector(authSelector);
  const navigate = useNavigate();
  const isSeller = result?.role === 'seller';
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    // Only fetch comments if user is logged in
    if (result) {
      fetchComments();
    }
  }, [productId, result]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${PRODUCTS_API}/${productId}/comments`);
      setComments(response.data);
    } catch (error: any) {
      message.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!result) {
      message.warning('Please log in to comment');
      return;
    }

    if (!newComment.trim()) {
      message.warning('Please enter a comment');
      return;
    }

    try {
      setSubmitting(true);
      const token = getToken() || '';
      await axios.post(
        `${PRODUCTS_API}/${productId}/comments`,
        { text: newComment, userId: result._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success('Comment added successfully');
      setNewComment('');
      fetchComments();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!result) {
      message.warning('Please log in to like comments');
      return;
    }

    try {
      const token = getToken() || '';
      await axios.patch(
        `${PRODUCTS_API}/${productId}/comments/${commentId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchComments();
    } catch (error: any) {
      message.error('Failed to like comment');
    }
  };

  const getUserName = (userId: any) => {
    if (typeof userId === 'object' && userId?.fullName) {
      return userId.fullName;
    }
    return 'Anonymous';
  };

  const getUserPhoto = (userId: any) => {
    if (typeof userId === 'object' && userId?.profilePhoto) {
      return userId.profilePhoto;
    }
    return null;
  };

  const handleReplyToComment = async (commentId: string) => {
    if (!result) {
      message.warning('Please log in to reply');
      return;
    }

    if (!replyText.trim()) {
      message.warning('Please enter a reply');
      return;
    }

    try {
      setSubmitting(true);
      await replyToCommentApi(productId, commentId, replyText);
      message.success('Reply added successfully');
      setReplyText('');
      setReplyingTo(null);
      fetchComments();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to add reply');
    } finally {
      setSubmitting(false);
    }
  };

  // If user is not logged in, show login prompt
  if (!result) {
    return (
      <Card title="Comments" className="product-comments">
        <div className="login-prompt">
          <p>Please log in to comment</p>
          <Button type="primary" onClick={() => navigate('/login')}>
            Log In
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Comments" className="product-comments">
      {!isSeller && (
        <div className="comment-form">
          <TextArea
            rows={4}
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            maxLength={500}
            showCount
          />
          <Button
            type="primary"
            onClick={handleSubmitComment}
            loading={submitting}
            className="submit-comment-btn"
          >
            Post Comment
          </Button>
        </div>
      )}

      {isSeller && (
        <div className="seller-notice">
          <p>As a seller, you can reply to comments but cannot add new comments.</p>
        </div>
      )}

      <div className="comments-list">
        <Spin spinning={loading}>
          {comments.length === 0 ? (
            <div className="no-comments">No comments yet. Be the first to comment!</div>
          ) : (
            comments.map((comment, index) => (
              <div key={comment._id || index} className="comment-item">
                <div className="comment-header">
                  <Avatar
                    src={getUserPhoto(comment.userId)}
                    icon={<UserOutlined />}
                    size={40}
                  />
                  <div className="comment-info">
                    <div className="user-name">{getUserName(comment.userId)}</div>
                    <div className="comment-date">
                      {comment.createdAt
                        ? new Date(comment.createdAt).toLocaleDateString()
                        : ''}
                    </div>
                  </div>
                </div>
                <div className="comment-text">{comment.text}</div>
                {comment.replies && comment.replies.length > 0 && (
                  <div className="comment-replies">
                    {comment.replies.map((reply, replyIndex) => (
                      <div key={replyIndex} className="reply-item">
                        <div className="reply-text">{reply}</div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="comment-actions">
                  <Button
                    type="text"
                    icon={<LikeOutlined />}
                    onClick={() => comment._id && handleLikeComment(comment._id)}
                  >
                    {comment.likes || 0}
                  </Button>
                  {isSeller && (
                    <Button
                      type="text"
                      icon={<CommentOutlined />}
                      onClick={() => setReplyingTo(comment._id || null)}
                    >
                      Reply
                    </Button>
                  )}
                </div>
                {isSeller && replyingTo === comment._id && (
                  <div className="reply-form">
                    <TextArea
                      rows={2}
                      placeholder="Write a reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      maxLength={300}
                    />
                    <div className="reply-actions">
                      <Button onClick={() => {
                        setReplyingTo(null);
                        setReplyText('');
                      }}>
                        Cancel
                      </Button>
                      <Button
                        type="primary"
                        onClick={() => comment._id && handleReplyToComment(comment._id)}
                        loading={submitting}
                      >
                        Post Reply
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </Spin>
      </div>
    </Card>
  );
};
