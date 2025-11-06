'use client';

import { Menu, MenuProps } from 'antd';
import { navData } from '@/data/static/navData';
import { useEffect, useState, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector } from '@/redux/store';
import { authSelector } from '@/redux/slice';
import { pageRoutes } from '@/data/static/pageRoutes';
import { isDeliveryRole } from '@/constants';
import styles from './Nav.module.scss';

/**
 * This is the main navigation component for the app.
 * @component general
 * @props none
 * @returns {JSX.Element}   Nav
 */

const Nav = (): JSX.Element => {
  const router = useRouter();
  const pathname = usePathname();
  const [current, setCurrent] = useState(pathname);
  const { result } = useAppSelector(authSelector);
  const userRole = result?.role;

  const onClick: MenuProps['onClick'] = (e) => {
    router.push(e.key as string);
    setCurrent(e.key as string);
  };

  useEffect(() => {
    setCurrent(pathname);
  }, [pathname]);

  // Filter navigation items based on user role
  // Products link should only be visible to buyers, sellers, and unauthenticated users
  const menuItems: MenuProps['items'] = useMemo(() => {
    // Ensure we always have menu items, even if userRole is undefined
    const isDeliveryUser = isDeliveryRole(userRole);

    // Show Products link only for buyers, sellers, or unauthenticated users
    const filteredNavData = navData.filter((item) => {
      if (item.key === `/${pageRoutes.products}`) {
        return !isDeliveryUser; // Hide for delivery users, but show for buyers/sellers/unauthenticated
      }
      return true; // Show all other links (Home, About, Contact, Privacy Policy)
    });

    // Convert filtered navData to Menu items format
    const items = filteredNavData.map((item) => ({
      key: item.key,
      label: item.label,
    }));

    // Ensure we always return at least the basic navigation items
    return items.length > 0
      ? items
      : navData.map((item) => ({
          key: item.key,
          label: item.label,
        }));
  }, [userRole]);

  // Fallback to all nav items if menuItems is somehow empty
  const finalMenuItems =
    menuItems && menuItems.length > 0
      ? menuItems
      : navData.map((item) => ({
          key: item.key,
          label: item.label,
        }));

  // Ensure we always have menu items
  const displayItems = finalMenuItems && finalMenuItems.length > 0 
    ? finalMenuItems 
    : navData.map((item) => ({
        key: item.key,
        label: item.label,
      }));

  return (
    <div className={styles.nav}>
      <Menu
        mode="horizontal"
        items={displayItems}
        onClick={onClick}
        selectedKeys={[current]}
        style={{ justifyContent: 'flex-end', minWidth: '200px', background: 'transparent', border: 'none' }}
        overflowedIndicator={null}
      />
    </div>
  );
};

export { Nav };
