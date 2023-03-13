import { ShoppingCartOutlined } from '@ant-design/icons';
import { Avatar, Badge, Button, Dropdown, MenuProps, theme } from 'antd';
import { LinkButton, List } from 'components/UI';
import { pageRoutes } from 'data/static/pageRoutes';
import { useAuth } from 'hooks';
import { Link } from 'react-router-dom';
import { signOut } from 'redux/slice';
import { useAppDispatch } from 'redux/store';
import { getNameInitials } from 'utils';

const { useToken } = theme;

type Props = {};

/**
 * This is the UserPanel component, which displays login button when user is not logged in. Otherwise, it displays cart icon and user avatar with dropdown menu.
 * @component feature
 * @param props none
 * @returns User Panel component
 */

export const UserPanel = (props: Props) => {
  const { token } = useToken();
  const auth = useAuth();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(signOut());
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
        <Button onClick={handleLogout} type="primary">
          Logout
        </Button>
      ),
    },
  ];

  auth?.result?.fullName && getNameInitials(auth?.result?.fullName);

  return (
    <>
      <List style={{ marginLeft: '10px' }}>
        {auth?.tokenStatus === 'valid' ? (
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
                style={{
                  backgroundColor: token.colorPrimaryBg,
                  cursor: 'pointer',
                }}
              >
                {auth?.result?.fullName &&
                  getNameInitials(auth.result.fullName)}
              </Avatar>
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
