import siteDataJson from './siteData.json';

export interface SiteData {
  site: {
    title: string;
    description: string;
    tagline: string;
  };
  contact: {
    phone: string;
    email: string;
    address: string;
    businessHours: string;
  };
  social: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
    youtube: string;
  };
  mobileApp: {
    appStore: string;
    googlePlay: string;
    available: boolean;
  };
  paymentMethods: string[];
  verifiedBadges: Array<{
    text: string;
    icon: string | null;
  }>;
  footerLinks: {
    customerCare: Array<{
      label: string;
      link: string;
      icon: string | null;
    }>;
    information: Array<{
      label: string;
      link: string;
      icon: string | null;
    }>;
    copyright: Array<{
      label: string;
      link: string;
    }>;
  };
  bannerSlides: Array<{
    id: string;
    type: string;
    title: string;
    subtitle?: string;
    description?: string;
    backgroundColor?: string;
    textColor?: string;
    buttonText?: string;
    buttonLink?: string;
    discount?: string;
    voucherCode?: string;
  }>;
}

export const siteData: SiteData = siteDataJson as SiteData;
