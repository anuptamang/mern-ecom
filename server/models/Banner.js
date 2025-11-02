import mongoose from 'mongoose';

const bannerSlideSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    enum: ['offer', 'voucher', 'coming-soon', 'featured', 'banner', 'flash-sale'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
  },
  description: {
    type: String,
  },
  image: {
    type: String,
  },
  backgroundColor: {
    type: String,
    default: '#1890ff',
  },
  textColor: {
    type: String,
    default: '#fff',
  },
  buttonText: {
    type: String,
  },
  buttonLink: {
    type: String,
  },
  discount: {
    type: String,
  },
  voucherCode: {
    type: String,
  },
  productId: {
    type: mongoose.Types.ObjectId,
    ref: 'Product',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

const BannerSlide = mongoose.model('BannerSlide', bannerSlideSchema);

export default BannerSlide;
