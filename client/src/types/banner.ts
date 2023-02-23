import { ReactNode } from 'react';

export type BannerProps = {
  heading?: string;
  imageUrl?: string;
  hasCaption?: boolean;
  hasChildren?: boolean;
  children?: ReactNode;
};
