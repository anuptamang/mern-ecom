import classNames from 'classnames';
import { CSSProperties, ReactNode } from 'react';
import styles from './Container.module.scss';

type TContainer = {
  children: ReactNode | ReactNode[];
  className?: string;
  style?: CSSProperties;
};

/**
 * Component - UI Container
 * @component
 * @props {children - required, style - optional}
 * @returns {JSX.Element}   User Dashboard
 */

const Container = ({ children, style, className }: TContainer) => {
  const classes = classNames(styles.container, className);
  return (
    <div className={classes} style={{ ...style }}>
      {children}
    </div>
  );
};

export { Container };
