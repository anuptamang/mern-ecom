import { ReactNode } from 'react';
import styles from './Container.module.scss';

type TContainer = {
  children: ReactNode | ReactNode[];
  style?: React.CSSProperties;
};

const Container = ({ children, style }: TContainer) => {
  return (
    <div className={styles.container} style={{ ...style }}>
      {children}
    </div>
  );
};

export { Container };
