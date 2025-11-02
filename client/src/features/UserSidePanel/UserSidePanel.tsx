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
      : !isDeliveryUser ? [
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
        ] : []),
    ...(!isDeliveryUser ? [
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
    ] : []),
    ...(!isAdmin ? [{
      key: `/${pageRoutes.userChats}`,
      label: (
        <Link
          style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
          to={`/${pageRoutes.userChats}`}
        >
          <MessageOutlined /> Messages
        </Link>
      ),
    }] : []),
    ...(isDeliveryAgency ? [{
      key: `/${pageRoutes.deliveryAgencyDashboard}`,
      label: (
        <Link
          style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
          to={`/${pageRoutes.deliveryAgencyDashboard}`}
        >
          <CarOutlined /> Delivery Dashboard
        </Link>
      ),
    }] : []),
    ...(isDeliveryPerson ? [{
      key: `/${pageRoutes.deliveryPersonDashboard}`,
      label: (
        <Link
          style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
          to={`/${pageRoutes.deliveryPersonDashboard}`}
        >
          <CarOutlined /> My Deliveries
        </Link>
      ),
    }] : []),
    ...(isWarehouseOperator ? [{
      key: `/user/warehouse-operator`,
      label: (
        <Link
          style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
          to={`/user/warehouse-operator`}
        >
          <CarOutlined /> Warehouse Console
        </Link>
      ),
    }] : []),
    ...(isSupport ? [{
      key: `/user/support`,
      label: (
        <Link
          style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
          to={`/user/support`}
        >
          <CustomerServiceOutlined /> Support Dashboard
        </Link>
      ),
    }] : []),
    ...(isVerificationTeam ? [{
      key: `/user/verification`,
      label: (
        <Link
          style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
          to={`/user/verification`}
        >
          <FileSearchOutlined /> Verification Dashboard
        </Link>
      ),
    }] : []),
    ...(isInspector ? [{
      key: `/user/inspector`,
      label: (
        <Link
          style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
          to={`/user/inspector`}
        >
          <AuditOutlined /> Inspector Dashboard
        </Link>
      ),
    }] : []),
    ...(isFinance ? [{
      key: `/user/finance`,
      label: (
        <Link
          style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
          to={`/user/finance`}
        >
          <DollarOutlined /> Finance Dashboard
        </Link>
      ),
    }] : []),
    ...(isReturnDeliverer ? [{
      key: `/user/return-deliverer`,
      label: (
        <Link
          style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
          to={`/user/return-deliverer`}
        >
          <ReturnUndoOutlined /> Return Deliverer Console
        </Link>
      ),
    }] : []),
    ...(isAdmin ? [{
      key: `/user/admin`,
      label: (
        <Link
          style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
          to={`/user/admin`}
        >
          <TeamOutlined /> Admin Dashboard
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
