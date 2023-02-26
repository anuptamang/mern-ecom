import { pageRoutes } from 'data/static/pageRoutes';
import { Link } from 'react-router-dom';
import styles from './Logo.module.scss';

type Props = {};

const Logo = (props: Props) => {
  return (
    <div className={styles.logo}>
      <Link to={pageRoutes.home}>MY SHOP</Link>
    </div>
  );
};

export { Logo };
