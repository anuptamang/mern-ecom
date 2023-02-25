import { Button } from 'antd';
import { LinkButton, List } from 'components/UI';
import React from 'react';
import { Link } from 'react-router-dom';

type Props = {};

export const UserMenu = (props: Props) => {
  return (
    <>
      <List>
        <li>
          <LinkButton type="primary" to="/login">
            Login
          </LinkButton>
        </li>
      </List>
    </>
  );
};
