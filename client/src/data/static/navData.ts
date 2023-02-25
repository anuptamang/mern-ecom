interface NavDataProps {
  key: number;
  text: string;
  to: string;
}

export const navData: NavDataProps[] = [
  {
    key: 1,
    text: 'Home',
    to: '/',
  },
  {
    key: 2,
    text: 'About',
    to: '/about'

  },
  {
    key: 3,
    text: 'Products',
    to: '/products',
  },
  {
    key: 4,
    text: 'Contact',
    to: '/contact',
  },
];
