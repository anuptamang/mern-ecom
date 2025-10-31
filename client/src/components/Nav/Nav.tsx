import { Menu, MenuProps } from 'antd';
import { navData } from 'data/static/navData';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * This is the main navigation component for the app.
 * @component general
 * @props none
 * @returns {JSX.Element}   Nav
 */

const Nav = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const [current, setCurrent] = useState(location?.pathname);

  const onClick: MenuProps['onClick'] = (e) => {
    navigate(e.key);
    setCurrent(e.key);
  };

  useEffect(() => {
    setCurrent(location.pathname);
  }, [location.pathname]);

  // Convert navData to Menu items format
  const menuItems: MenuProps['items'] = navData.map((item) => ({
    key: item.key,
    label: item.label,
  }));

  return (
    <>
      <Menu
        theme="dark"
        mode="horizontal"
        items={menuItems}
        onClick={onClick}
        selectedKeys={[current]}
        style={{ justifyContent: 'flex-end' }}
        overflowedIndicator={null}
      />
    </>
  );
};

export { Nav };
