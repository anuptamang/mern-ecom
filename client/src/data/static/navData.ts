import { pageRoutes } from "./pageRoutes";

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
    key: `/${pageRoutes.about}`,
    label: 'About',
    to: `/${pageRoutes.about}`,

  },
  {
    key: `/${pageRoutes.products}`,
    label: 'Products',
    to: `/${pageRoutes.products}`,
  },
  {
    key: `/${pageRoutes.contact}`,
    label: 'Contact',
    to: `/${pageRoutes.contact}`,
  },
];
