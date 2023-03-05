import { Col, Row } from 'antd';
import {
  ProfileStatus,
  StoreStatus,
  CartsStatus,
  SettingsStatus,
} from 'features';

export const DashboardSummary = () => {
  return (
    <Row gutter={30}>
      <Col className="flex flex-grow" xs={24} md={8} xl={6}>
        <div className="w-full flex">
          <ProfileStatus />
        </div>
      </Col>
      <Col className="flex flex-grow" xs={24} md={8} xl={6}>
        <div className="w-full flex">
          <StoreStatus />
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
