import { ArrowLeftOutlined } from '@ant-design/icons';
import { Result } from 'antd';
import styles from 'assets/styles/Common.module.scss';
import { Container } from 'components/UI';
import { pageRoutes } from 'data/static/pageRoutes';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <>
      <Helmet>
        <title>Not Found | My App</title>
      </Helmet>
      <Container className={styles.pageContainer}>
        <Result
          status="404"
          title="404"
          subTitle="Sorry, the page you visited does not exist."
          extra={
            <Link className="underline" to={pageRoutes.home}>
              <ArrowLeftOutlined className="mr-2" />
              Back Home
            </Link>
          }
        />
      </Container>
    </>
  );
};

export { NotFoundPage };
