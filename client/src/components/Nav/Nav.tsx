import { Menu, MenuProps } from 'antd';
import { navData } from 'data/static/navData';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Props = {};

const Nav = (props: Props) => {
  const [current, setCurrent] = useState('/');
  const navigate = useNavigate();

  const onClick: MenuProps['onClick'] = (e) => {
    navigate(e.key);
    setCurrent(e.key);
  };

  return (
    <>
      <Menu
        theme="dark"
        mode="horizontal"
        items={navData}
        onClick={onClick}
        selectedKeys={[current]}
        style={{ justifyContent: 'flex-end' }}
      />
    </>
  );
};

export { Nav };
