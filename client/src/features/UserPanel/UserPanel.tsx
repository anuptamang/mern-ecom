'use client';

import { ShoppingCartOutlined } from '@ant-design/icons';
import { Avatar, Badge, Button, Dropdown, MenuProps, theme } from 'antd';
import { LinkButton, List } from '@/components/UI';
import { pageRoutes } from '@/data/static/pageRoutes';
import { useAuth } from '@/hooks';
import Link from 'next/link';
import { signOut } from '@/redux/slice';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { getNameInitials } from '@/utils';
import { useEffect } from 'react';
import { fetchMyCart } from '@/redux/slice/carts/cartsSlice';
import { NotificationBell } from '@/components/Notifications/NotificationBell';
import { useTheme } from '@/hooks/useTheme';

const { useToken } = theme;

type Props = {};

/**
 * This is the UserPanel component, which displays login button when user is not logged in. Otherwise, it displays cart icon and user avatar with dropdown menu.
 * @component feature
 * @param props none
 * @returns User Panel component
 */

export const UserPanel = (props: Props) => {
  const { token } = useToken();
  const { colorScheme } = useTheme();
  const auth = useAuth();
  const dispatch = useAppDispatch();
  const carts = useAppSelector((state) => state.carts);
  const isSeller = auth?.result?.role === 'seller';
  const isDeliveryAgency = auth?.result?.role === 'delivery_agency';
  const isDeliveryPerson = auth?.result?.role === 'delivery_person';
  const isWarehouseOperator = auth?.result?.role === 'warehouse_operator';
  const isFinance = auth?.result?.role === 'finance';
  const isSupport = auth?.result?.role === 'support' || auth?.result?.role === 'support_user';
  const isVerificationTeam = auth?.result?.role === 'verification_team';
  const isInspector = auth?.result?.role === 'return_inspector';
  const isReturnDeliverer = auth?.result?.role === 'delivery_person' && auth?.result?.delivererType === 'customer_return';
  const isAdmin = auth?.result?.role === 'admin';
  const isDeliveryUser = isDeliveryAgency || isDeliveryPerson || isWarehouseOperator || isFinance || isSupport || isVerificationTeam || isInspector || isReturnDeliverer || isAdmin;

  useEffect(() => {
    if (auth?.tokenStatus === 'valid' && !isSeller && !isDeliveryUser) {
      dispatch(fetchMyCart());
    }
  }, [auth?.tokenStatus, dispatch, isSeller, isDeliveryUser]);

  const handleLogout = () => {
    dispatch(signOut());
  };

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: <Link href={`/${pageRoutes.userDashboard}`}>Dashboard</Link>,
    },
    {
      key: '2',
      label: <Link href={`/${pageRoutes.userProfile}`}>Profile</Link>,
    },
    {
      key: '3',
      label: <Link href={`/${pageRoutes.userSettings}`}>Settings</Link>,
    },
    {
      key: '4',
      label: (
        <Button onClick={handleLogout} type="primary">
          Logout
        </Button>
      ),
    },
  ];

  auth?.result?.fullName && getNameInitials(auth?.result?.fullName);

  return (
    <>
      <List style={{ marginLeft: '10px' }}>
        {auth?.tokenStatus === 'valid' ? (
          <li style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <NotificationBell />
            {!isSeller && !isDeliveryUser && (
              <Link href={`/${pageRoutes.userCarts}`}>
                <Badge 
                  size="small" 
                  count={carts.totalCount || 0} 
                  color={colorScheme.primary || '#0071e3'}
                  style={{ 
                    '--ant-badge-dot-size': '6px',
                  } as React.CSSProperties}
                >
                  <ShoppingCartOutlined
                    style={{ 
                      color: 'var(--theme-header-text, #1d1d1f)', 
                      fontSize: '24px',
                      transition: 'color 0.3s ease'
                    }}
                  />
                </Badge>
              </Link>
            )}
            <Dropdown
              trigger={['click']}
              menu={{ items }}
              placement="bottomRight"
              arrow
            >
              <Avatar
                src="https://joesch.me/api/v1/random"
                style={{
                  backgroundColor: colorScheme.primary || token.colorPrimaryBg,
                  cursor: 'pointer',
                  color: colorScheme.textInverse || '#ffffff',
                  fontWeight: 500,
                }}
              >
                {auth?.result?.fullName &&
                  getNameInitials(auth.result.fullName)}
              </Avatar>
            </Dropdown>
          </li>
        ) : (
          <li>
            <LinkButton type="primary" to={`/${pageRoutes.login}`}>
              Login
            </LinkButton>
          </li>
        )}
      </List>
    </>
  );
};
