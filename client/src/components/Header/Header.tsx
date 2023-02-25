import { Col, Row } from 'antd';
import { Container, HeaderLayout } from 'components/UI';
import { Logo, Nav } from 'components';
import { UserMenu } from 'components/UserMenu/UserMenu';

type Props = {};

export const Header = (props: Props) => {
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
                  alignItems: 'center',
                }}
              >
                <Nav />
                <UserMenu />
              </div>
            </Col>
          </Row>
        </Container>
      </HeaderLayout>
    </>
  );
};
