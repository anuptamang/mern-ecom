import { pageRoutes } from 'data/static/pageRoutes';
import { Link } from 'react-router-dom';
import styles from './Logo.module.scss';
import { siteInfo } from 'configs/site';

type Props = {};

const Logo = (props: Props) => {
  return (
    <div className={styles.logo}>
      <Link to={pageRoutes.home}>{siteInfo.title}</Link>
    </div>
  );
};

export { Logo };
