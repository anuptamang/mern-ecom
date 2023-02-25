import classNames from 'classnames';
import { ReactNode } from 'react';
import styles from './List.module.scss';

interface Ilist {
  children: ReactNode | ReactNode[];
  mode?: 'vertical';
}

const List = ({ children, mode }: Ilist) => {
  const classes = classNames(styles.list, mode && styles.vertical);

  return (
    <ul className={classes} style={{ justifyContent: 'center' }}>
      {children}
    </ul>
  );
};

export { List };
