import { pageRoutes } from './pageRoutes';

export interface NavDataProps {
  key: string;
  label: string;
  to: string;
}

export const navData: NavDataProps[] = [
  {
    key: `${pageRoutes.home}`,
    label: 'Home',
    to: `${pageRoutes.home}`,
  },
  {
    key: `/${pageRoutes.products}`,
    label: 'Products',
    to: `/${pageRoutes.products}`,
  },
  {
    key: `/${pageRoutes.about}`,
    label: 'About',
    to: `/${pageRoutes.about}`,
  },
  {
    key: `/${pageRoutes.contact}`,
    label: 'Contact',
    to: `/${pageRoutes.contact}`,
  },
  {
    key: '/documentation',
    label: 'Documentation',
    to: '/documentation',
  },
];
