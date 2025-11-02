import axios from 'axios';
import { BANNERS_API } from 'services/servicesConstants';
import { getToken } from 'utils/localStorage';

export interface BannerSlide {
  id: string;
  type: 'offer' | 'voucher' | 'coming-soon' | 'featured' | 'banner' | 'flash-sale';
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonText?: string;
  buttonLink?: string;
  discount?: string;
  voucherCode?: string;
  productId?: string;
  isActive?: boolean;
  order?: number;
}

/**
 * Get all banner slides
 */
export const getBannerSlidesApi = async (params?: { type?: string; isActive?: boolean }) => {
  return axios.get(BANNERS_API, { params });
};

/**
 * Get a single banner slide by ID
 */
export const getBannerSlideApi = async (id: string) => {
  return axios.get(`${BANNERS_API}/${id}`);
};

/**
 * Create a new banner slide (Admin only)
 */
export const createBannerSlideApi = async (slideData: BannerSlide) => {
  const token = getToken() || '';
  return axios.post(
    BANNERS_API,
    slideData,
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

/**
 * Update a banner slide (Admin only)
 */
export const updateBannerSlideApi = async (id: string, slideData: Partial<BannerSlide>) => {
  const token = getToken() || '';
  return axios.put(
    `${BANNERS_API}/${id}`,
    slideData,
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

/**
 * Delete a banner slide (Admin only)
 */
export const deleteBannerSlideApi = async (id: string) => {
  const token = getToken() || '';
  return axios.delete(
    `${BANNERS_API}/${id}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

/**
 * Reorder banner slides (Admin only)
 */
export const reorderBannerSlidesApi = async (slides: Array<{ id: string; order: number }>) => {
  const token = getToken() || '';
  return axios.post(
    `${BANNERS_API}/reorder`,
    { slides },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};
