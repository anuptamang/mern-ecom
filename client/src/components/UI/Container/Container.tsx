import { ChildrenProps } from 'types';
import styles from './Container.module.scss';

const Container = ({ children }: ChildrenProps) => {
  return <div className={styles.container}>{children}</div>;
};

export { Container };
