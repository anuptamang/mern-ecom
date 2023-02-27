interface IPageRoutes {
  home: string,
  about: string,
  products: string,
  contact: string,
  login: string,
  register: string,
  forgotPassword: string,
  privacyPolicy: string,
  user: string,
  userDashboard: string,
  userProfile: string,
  userSettings: string,
  userProducts: string,
  userPrivacyPolicy: string,
  dashboard: string,
  profile: string,
  settings: string,
  carts: string,
  userCarts: string,
}

export const pageRoutes: IPageRoutes = {
  home: '/',
  about: 'about',
  products: 'products',
  contact: 'contact',
  login: 'login',
  register: 'register',
  forgotPassword: 'forgot-password',
  privacyPolicy: 'privacy-policy',
  user: 'user',
  dashboard: 'dashboard',
  profile: 'profile',
  settings: 'settings',
  carts: 'carts',
  userDashboard: 'user/dashboard',
  userProfile: 'user/profile',
  userSettings: 'user/settings',
  userProducts: 'user/products',
  userPrivacyPolicy: 'user/privacy-policy',
  userCarts: 'user/carts',
}