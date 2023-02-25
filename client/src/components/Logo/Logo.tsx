import React from 'react';
import styles from './Logo.module.scss';
import { Link } from 'react-router-dom';

type Props = {};

const Logo = (props: Props) => {
  return (
    <div className={styles.logo}>
      <Link to={'/'}>MY SHOP</Link>
    </div>
  );
};

export { Logo };
