import { Container } from 'components';
import { usePageTitle } from 'hooks/usePageTitle';
import { ReactNode } from 'react';

type Props = {};

const ProductsSinglePage = (props: Props) => {
  const title: ReactNode = usePageTitle();

  return (
    <>
      {title}
      <Container>
        <h1>Product Single Page</h1>
      </Container>
    </>
  );
};

export { ProductsSinglePage };
