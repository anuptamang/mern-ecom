import { Col, Row } from 'antd';
import {
  ProfileStatus,
  StoreStatus,
  WishlistStatus,
  CartsStatus,
  SettingsStatus,
} from '@/features';
import { useAppSelector } from '@/redux/store';
import { authSelector } from '@/redux/slice';

export const DashboardSummary = () => {
  const { result } = useAppSelector(authSelector);
  const isSeller = result?.role === 'seller';
  
  // Hide dashboard sections for delivery users and admin
  const isDeliveryUser = result?.role === 'delivery_agency' || 
                         result?.role === 'delivery_person' || 
                         result?.role === 'warehouse_operator' ||
                         result?.role === 'support' ||
                         result?.role === 'support_user' ||
                         result?.role === 'verification_team' ||
                         result?.role === 'return_inspector' ||
                         result?.role === 'return_deliverer' ||
                         result?.role === 'finance' ||
                         result?.role === 'admin';
  
  const isBuyer = result?.role === 'user';

  if (isDeliveryUser) {
    // For delivery users, only show Profile and Settings
    return (
      <Row gutter={30}>
        <Col className="flex flex-grow" xs={24} md={12} xl={12}>
          <div className="w-full flex">
            <ProfileStatus />
          </div>
        </Col>
        <Col className="flex flex-grow" xs={24} md={12} xl={12}>
          <div className="w-full flex">
            <SettingsStatus />
          </div>
        </Col>
      </Row>
    );
  }

  return (
    <Row gutter={30}>
      <Col className="flex flex-grow" xs={24} md={8} xl={6}>
        <div className="w-full flex">
          <ProfileStatus />
        </div>
      </Col>
      {isBuyer && (
        <Col className="flex flex-grow" xs={24} md={8} xl={6}>
          <div className="w-full flex">
            {isSeller ? <StoreStatus /> : <WishlistStatus />}
          </div>
        </Col>
      )}
      {isBuyer && (
        <Col className="flex flex-grow" xs={24} md={8} xl={6}>
          <div className="w-full flex">
            <CartsStatus />
          </div>
        </Col>
      )}
      <Col className="flex flex-grow" xs={24} md={8} xl={6}>
        <div className="w-full flex">
          <SettingsStatus />
        </div>
      </Col>
    </Row>
  );
};
