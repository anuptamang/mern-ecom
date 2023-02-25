export interface NavDataProps {
  key: string;
  label: string;
  to: string;
}

export const navData: NavDataProps[] = [
  {
    key: '/',
    label: 'Home',
    to: '/',
  },
  {
    key: '/about',
    label: 'About',
    to: '/about'

  },
  {
    key: '/products',
    label: 'Products',
    to: '/products',
  },
  {
    key: '/contact',
    label: 'Contact',
    to: '/contact',
  },
];
