import { IChildren } from 'types';
import styles from './Container.module.scss';

const Container = ({ children }: IChildren) => {
  return <div className={styles.container}>{children}</div>;
};

export { Container };
