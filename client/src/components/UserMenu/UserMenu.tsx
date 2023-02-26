import { LinkButton, List } from 'components/UI';

type Props = {};

export const UserMenu = (props: Props) => {
  return (
    <>
      <List style={{ marginLeft: '10px' }}>
        <li>
          <LinkButton type="primary" to="/login">
            Login
          </LinkButton>
        </li>
      </List>
    </>
  );
};
