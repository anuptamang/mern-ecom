import { Container } from 'components';
import { Helmet } from 'react-helmet-async';

type Props = {};

const ProductsSinglePage = (props: Props) => {
  return (
    <>
      <Helmet>
        <title>Product Single | My App</title>
      </Helmet>
      <Container>
        <h1>Product Single Page</h1>
      </Container>
    </>
  );
};

export { ProductsSinglePage };
