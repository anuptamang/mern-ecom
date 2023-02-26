import { List } from 'components/UI';
import { FooterLayout } from 'components/UI/Layout/Layout';
import { Link } from 'react-router-dom';
import styles from './Footer.module.scss';

type Props = {};

export const Footer = (props: Props) => {
  return (
    <FooterLayout className={styles.footer}>
      <List style={{ justifyContent: 'center' }}>
        <li>
          <strong>&copy; 2023 - MY SHOP</strong>
        </li>
        <li>
          <Link to={'/privacy-policy'}>Privacy Policy</Link>
        </li>
      </List>
    </FooterLayout>
  );
};
