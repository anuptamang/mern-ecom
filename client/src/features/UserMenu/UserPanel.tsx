import { ShoppingCartOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Badge, Button, Dropdown, MenuProps, theme } from 'antd';
import { LinkButton, List } from 'components/UI';
import { pageRoutes } from 'data/static/pageRoutes';
import { useAuth } from 'hooks';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const { useToken } = theme;

type Props = {};

export const UserPanel = (props: Props) => {
  const { token } = useToken();
  const auth = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    setLoading(true);
    //
  };

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: <Link to={`/${pageRoutes.userDashboard}`}>Dashboard</Link>,
    },
    {
      key: '2',
      label: <Link to={`/${pageRoutes.userProfile}`}>Profile</Link>,
    },
    {
      key: '3',
      label: <Link to={`/${pageRoutes.userSettings}`}>Settings</Link>,
    },
    {
      key: '4',
      label: (
        <Button onClick={handleLogout} loading={loading} type="primary">
          Logout
        </Button>
      ),
    },
  ];

  return (
    <>
      <List style={{ marginLeft: '10px' }}>
        {auth?.token ? (
          <li style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <Link to={`/${pageRoutes.userCarts}`}>
              <Badge size="small" count={0} color={token.colorPrimaryBg}>
                <ShoppingCartOutlined
                  style={{ color: 'white', fontSize: '24px' }}
                />
              </Badge>
            </Link>
            <Dropdown
              trigger={['click']}
              menu={{ items }}
              placement="bottomRight"
              arrow
            >
              <Avatar
                src="https://joesch.me/api/v1/random"
                icon={<UserOutlined />}
                style={{
                  backgroundColor: token.colorPrimaryBg,
                  cursor: 'pointer',
                }}
              />
            </Dropdown>
          </li>
        ) : (
          <li>
            <LinkButton type="primary" to={`/${pageRoutes.login}`}>
              Login
            </LinkButton>
          </li>
        )}
      </List>
    </>
  );
};
