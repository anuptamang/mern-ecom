'use client';

import {
  AppstoreOutlined,
  DashboardOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  ShoppingOutlined,
  HeartOutlined,
  UndoOutlined,
  CarOutlined,
  MessageOutlined,
  DollarOutlined,
  CustomerServiceOutlined,
  FileSearchOutlined,
  AuditOutlined,
  UndoOutlined as ReturnUndoOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Menu, MenuProps } from 'antd';
import { pageRoutes } from '@/data/static/pageRoutes';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector } from '@/redux/store';
import { authSelector } from '@/redux/slice';

/**
 * This is the logged in user side panel component, which displays user dashboard, profile, store, carts, orders and settings links.
 * @component feature
 * @param props none
 * @returns User side panel component
 */

export const UserSidePanel = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [current, setCurrent] = useState(pathname);
  const { result } = useAppSelector(authSelector);
  const isSeller = result?.role === 'seller';
  const isDeliveryAgency = result?.role === 'delivery_agency';
  const isDeliveryPerson = result?.role === 'delivery_person';
  const isWarehouseOperator = result?.role === 'warehouse_operator';
  const isFinance = result?.role === 'finance';
  const isSupport = result?.role === 'support' || result?.role === 'support_user';
  const isVerificationTeam = result?.role === 'verification_team';
  const isInspector = result?.role === 'return_inspector';
  const isReturnDeliverer = result?.role === 'delivery_person' && result?.delivererType === 'customer_return';
  const isAdmin = result?.role === 'admin';
  const isDeliveryUser = isDeliveryAgency || isDeliveryPerson || isWarehouseOperator || isFinance || isSupport || isVerificationTeam || isInspector || isReturnDeliverer || isAdmin;

  const onClick: MenuProps['onClick'] = (e) => {
    router.push(e.key as string);
    setCurrent(e.key as string);
  };

  useEffect(() => {
    setCurrent(pathname);
  }, [pathname]);

  const items: MenuProps['items'] = [
    {
      key: `/${pageRoutes.userDashboard}`,
      label: (
        <Link
          style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
          href={`/${pageRoutes.userDashboard}`}
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
          href={`/${pageRoutes.userProfile}`}
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
                href={`/${pageRoutes.userProducts}`}
              >
                <AppstoreOutlined /> Store
              </Link>
            ),
          },
        ]
      : !isDeliveryUser ? [
          {
            key: `/${pageRoutes.user}/wishlist`,
            label: (
              <Link
                style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
                href={`/${pageRoutes.user}/wishlist`}
              >
                <HeartOutlined /> Wishlist
              </Link>
            ),
          },
          {
            key: `/${pageRoutes.userCarts}`,
            label: (
              <Link
                style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
                href={`/${pageRoutes.userCarts}`}
              >
                <ShoppingCartOutlined /> Cart
              </Link>
            ),
          },
          {
            key: `/${pageRoutes.user}/orders`,
            label: (
              <Link
                style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
                href={`/${pageRoutes.user}/orders`}
              >
                <ShoppingOutlined /> Orders
              </Link>
            ),
          },
          {
            key: `/${pageRoutes.user}/returns`,
            label: (
              <Link
                style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
                href={`/${pageRoutes.user}/returns`}
              >
                <UndoOutlined /> Returns
              </Link>
            ),
          },
          {
            key: `/${pageRoutes.user}/chats`,
            label: (
              <Link
                style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
                href={`/${pageRoutes.user}/chats`}
              >
                <MessageOutlined /> Chats
              </Link>
            ),
          },
        ] : []),
    ...(isDeliveryAgency
      ? [
          {
            key: `/${pageRoutes.user}/delivery-agency`,
            label: (
              <Link
                style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
                href={`/${pageRoutes.user}/delivery-agency`}
              >
                <CarOutlined /> Delivery Agency
              </Link>
            ),
          },
        ]
      : []),
    ...(isDeliveryPerson && !isReturnDeliverer
      ? [
          {
            key: `/${pageRoutes.user}/delivery-person`,
            label: (
              <Link
                style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
                href={`/${pageRoutes.user}/delivery-person`}
              >
                <CarOutlined /> Delivery Person
              </Link>
            ),
          },
        ]
      : []),
    ...(isReturnDeliverer
      ? [
          {
            key: `/${pageRoutes.user}/return-deliverer`,
            label: (
              <Link
                style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
                href={`/${pageRoutes.user}/return-deliverer`}
              >
                <ReturnUndoOutlined /> Return Deliverer
              </Link>
            ),
          },
        ]
      : []),
    ...(isWarehouseOperator
      ? [
          {
            key: `/${pageRoutes.user}/warehouse-operator`,
            label: (
              <Link
                style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
                href={`/${pageRoutes.user}/warehouse-operator`}
              >
                <AppstoreOutlined /> Warehouse Operator
              </Link>
            ),
          },
        ]
      : []),
    ...(isSupport
      ? [
          {
            key: `/${pageRoutes.user}/support`,
            label: (
              <Link
                style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
                href={`/${pageRoutes.user}/support`}
              >
                <CustomerServiceOutlined /> Support
              </Link>
            ),
          },
        ]
      : []),
    ...(isVerificationTeam
      ? [
          {
            key: `/${pageRoutes.user}/verification`,
            label: (
              <Link
                style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
                href={`/${pageRoutes.user}/verification`}
              >
                <FileSearchOutlined /> Verification Team
              </Link>
            ),
          },
        ]
      : []),
    ...(isInspector
      ? [
          {
            key: `/${pageRoutes.user}/inspector`,
            label: (
              <Link
                style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
                href={`/${pageRoutes.user}/inspector`}
              >
                <AuditOutlined /> Inspector
              </Link>
            ),
          },
        ]
      : []),
    ...(isFinance
      ? [
          {
            key: `/${pageRoutes.user}/finance`,
            label: (
              <Link
                style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
                href={`/${pageRoutes.user}/finance`}
              >
                <DollarOutlined /> Finance
              </Link>
            ),
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            key: `/${pageRoutes.user}/admin`,
            label: (
              <Link
                style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
                href={`/${pageRoutes.user}/admin`}
              >
                <TeamOutlined /> Admin
              </Link>
            ),
          },
        ]
      : []),
    {
      key: `/${pageRoutes.userSettings}`,
      label: (
        <Link
          style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
          href={`/${pageRoutes.userSettings}`}
        >
          <SettingOutlined /> Settings
        </Link>
      ),
    },
  ];

  return (
    <Menu
      mode="inline"
      items={items}
      onClick={onClick}
      selectedKeys={[current]}
      style={{ border: 'none' }}
    />
  );
};
