import classNames from 'classnames';
import { CSSProperties, ReactNode } from 'react';
import styles from './List.module.scss';

interface Ilist {
  children: ReactNode | ReactNode[];
  mode?: 'vertical';
  style?: CSSProperties;
}

const List = ({ children, mode, style }: Ilist) => {
  const classes = classNames(styles.list, mode && styles.vertical);

  return (
    <ul className={classes} style={style && { ...style }}>
      {children}
    </ul>
  );
};

export { List };
