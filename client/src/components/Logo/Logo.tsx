import { pageRoutes } from 'data/static/pageRoutes';
import { Link } from 'react-router-dom';
import { ShoppingOutlined } from '@ant-design/icons';
import styles from './Logo.module.scss';
import { siteData } from 'data/static/siteData';

/**
 * Component - Logo
 * @component
 * @props none
 * @returns {JSX.Element}   Logo
 */

const Logo = (): JSX.Element => {
  return (
    <div className={styles.logo}>
      <Link to={pageRoutes.home} className={styles.logoLink}>
        <div className={styles.logoIcon}>
          <ShoppingOutlined />
        </div>
        <span className={styles.logoText}>{siteData.site.title}</span>
      </Link>
    </div>
  );
};

export { Logo };
