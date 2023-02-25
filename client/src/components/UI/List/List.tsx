import React, { ReactNode } from 'react';
import { ChildrenProps } from 'types';
import styles from './List.module.scss';
import classNames from 'classnames';

interface Ilist {
  children: ReactNode[];
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
