import { List } from 'components/UI';
import { FooterLayout } from 'components/UI/Layout/Layout';
import { Link } from 'react-router-dom';
import styles from './Footer.module.scss';
import { pageRoutes } from 'data/static/pageRoutes';
import { siteInfo } from 'configs/site';

/**
 * Component - Footer
 * @component
 * @props none
 * @returns {JSX.Element}   Footer
 */

export const Footer = (): JSX.Element => {
  return (
    <FooterLayout className={styles.footer}>
      <List style={{ justifyContent: 'center' }}>
        <li>
          <strong>
            &copy; {new Date().getFullYear()} - {siteInfo.title}
          </strong>
        </li>
        -
        <li>
          <Link to={`/${pageRoutes.privacyPolicy}`}>Privacy Policy</Link>
        </li>
      </List>
    </FooterLayout>
  );
};
