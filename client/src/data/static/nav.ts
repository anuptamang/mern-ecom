interface NavProps {
  key: number;
  text: string;
  to: string;
}

export const nav: NavProps[] = [
  {
    key: 1,
    text: 'Home',
    to: '/',
  },
  {
    key: 2,
    text: 'About',
    to: '/about',
  },
  {
    key: 3,
    text: 'Portfolio',
    to: '/portfolio',
  },
  {
    key: 4,
    text: 'Contact',
    to: '/contact',
  },
];
