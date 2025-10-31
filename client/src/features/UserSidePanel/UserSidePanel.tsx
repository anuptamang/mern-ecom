import {
  AppstoreOutlined,
  DashboardOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  ShoppingOutlined,
  HeartOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import { Menu, MenuProps } from 'antd';
import { pageRoutes } from 'data/static/pageRoutes';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from 'redux/store';
import { authSelector } from 'redux/slice';

/**
 * This is the logged in user side panel component, which displays user dashboard, profile, store, carts, orders and settings links.
 * @component feature
 * @param props none
 * @returns User side panel component
 */

export const UserSidePanel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [current, setCurrent] = useState(location?.pathname);
  const { result } = useAppSelector(authSelector);
  const isSeller = result?.role === 'seller';

  const onClick: MenuProps['onClick'] = (e) => {
    navigate(e.key);
    setCurrent(e.key);
  };

  useEffect(() => {
    setCurrent(location.pathname);
  }, [location.pathname]);

  const items: MenuProps['items'] = [
    {
      key: `/${pageRoutes.userDashboard}`,
      label: (
        <Link
          style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
          to={`/${pageRoutes.userDashboard}`}
        >
          <DashboardOutlined /> Dashboard
        </Link>
      ),
    },
    {
      key: `/${pageRoutes.userProfile}`,
      label: (
        <Link
          style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
          to={`/${pageRoutes.userProfile}`}
        >
          <UserOutlined />
          Profile
        </Link>
      ),
    },
    ...(isSeller
      ? [
          {
            key: `/${pageRoutes.userProducts}`,
            label: (
              <Link
                style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
                to={`/${pageRoutes.userProducts}`}
              >
                <AppstoreOutlined /> Store
              </Link>
            ),
          },
        ]
      : [
          {
            key: `/${pageRoutes.user}/wishlist`,
            label: (
              <Link
                style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
                to={`/${pageRoutes.user}/wishlist`}
              >
                <HeartOutlined /> Wishlist
              </Link>
            ),
          },
        ]),
    {
      key: `/${pageRoutes.userCarts}`,
      label: (
        <Link
          style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
          to={`/${pageRoutes.userCarts}`}
        >
          <ShoppingCartOutlined /> Carts
        </Link>
      ),
    },
    {
      key: `/${pageRoutes.userOrders}`,
      label: (
        <Link
          style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
          to={`/${pageRoutes.userOrders}`}
        >
          <ShoppingOutlined /> Orders
        </Link>
      ),
    },
    ...(!isSeller ? [{
      key: `/${pageRoutes.userReturns}`,
      label: (
        <Link
          style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
          to={`/${pageRoutes.userReturns}`}
        >
          <UndoOutlined /> Returns & Refunds
        </Link>
      ),
    }] : []),
    {
      key: `/${pageRoutes.userSettings}`,
      label: (
        <Link
          style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
          to={`/${pageRoutes.userSettings}`}
        >
          <SettingOutlined /> Settings
        </Link>
      ),
    },
  ];

  return (
    <>
      <Menu
        theme="dark"
        mode="inline"
        onClick={onClick}
        selectedKeys={[current]}
        items={items}
      />
    </>
  );
};
