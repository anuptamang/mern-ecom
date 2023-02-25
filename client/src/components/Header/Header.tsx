import { Col, Row } from 'antd';
import { Container, HeaderLayout } from 'components/UI';
import { Logo, Nav } from 'components';

type Props = {};

export const Header = (props: Props) => {
  return (
    <>
      <HeaderLayout style={{ paddingInline: 0 }}>
        <Container>
          <Row>
            <Col xs={10} md={6}>
              <Logo />
            </Col>
            <Col xs={14} md={18}>
              <Nav />
            </Col>
          </Row>
        </Container>
      </HeaderLayout>
    </>
  );
};
