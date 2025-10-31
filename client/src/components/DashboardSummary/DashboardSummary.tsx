import { Col, Row } from 'antd';
import {
  ProfileStatus,
  StoreStatus,
  WishlistStatus,
  CartsStatus,
  SettingsStatus,
} from 'features';
import { useAppSelector } from 'redux/store';
import { authSelector } from 'redux/slice';

export const DashboardSummary = () => {
  const { result } = useAppSelector(authSelector);
  const isSeller = result?.role === 'seller';

  return (
    <Row gutter={30}>
      <Col className="flex flex-grow" xs={24} md={8} xl={6}>
        <div className="w-full flex">
          <ProfileStatus />
        </div>
      </Col>
      <Col className="flex flex-grow" xs={24} md={8} xl={6}>
        <div className="w-full flex">
          {isSeller ? <StoreStatus /> : <WishlistStatus />}
        </div>
      </Col>
      <Col className="flex flex-grow" xs={24} md={8} xl={6}>
        <div className="w-full flex">
          <CartsStatus />
        </div>
      </Col>
      <Col className="flex flex-grow" xs={24} md={8} xl={6}>
        <div className="w-full flex">
          <SettingsStatus />
        </div>
      </Col>
    </Row>
  );
};
