import { Col, Row } from 'antd';
import { Container } from 'components';
import { LoginForm } from 'components/LoginForm/LoginForm';

type TProps = {};

const Login = (props: TProps) => {
  return (
    <>
      <Container>
        <Row justify={'center'}>
          <Col md={10}>
            <LoginForm />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export { Login };
