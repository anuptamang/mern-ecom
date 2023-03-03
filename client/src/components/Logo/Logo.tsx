import { pageRoutes } from 'data/static/pageRoutes';
import { Link } from 'react-router-dom';
import styles from './Logo.module.scss';
import { siteInfo } from 'configs/site';

/**
 * Component - Logo
 * @component
 * @props none
 * @returns {JSX.Element}   Logo
 */

const Logo = (): JSX.Element => {
  return (
    <div className={styles.logo}>
      <Link to={pageRoutes.home}>{siteInfo.title}</Link>
    </div>
  );
};

export { Logo };
