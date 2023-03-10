import { Col, Row } from 'antd';
import { Logo, Nav } from 'components';
import { Container, HeaderLayout } from 'components/UI';
import { UserPanel } from 'features/UserPanel/UserPanel';

/**
 * Component - Header
 * @component
 * @props none
 * @returns {JSX.Element}   Header
 */

export const Header = (): JSX.Element => {
  return (
    <>
      <HeaderLayout style={{ paddingInline: 0, height: 'auto' }}>
        <Container>
          <Row>
            <Col xs={10} md={6}>
              <Logo />
            </Col>
            <Col xs={14} md={18}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                <Nav />
                <UserPanel />
              </div>
            </Col>
          </Row>
        </Container>
      </HeaderLayout>
    </>
  );
};
