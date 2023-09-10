import { DashboardSummary } from 'components/DashboardSummary';
import { useAuth } from 'hooks';
import { usePageTitle } from 'hooks/usePageTitle';
import { capitalizeText, getUserName } from 'utils';

/**
 * This is the component for the user's dashboard page.
 * @component page
 * @props  none
 * @returns {JSX.Element}   User Dashboard
 */

const UserDashboardPage = (): JSX.Element => {
  const auth = useAuth();
  // const userName = getUserName(auth.user?.name);
  const title = usePageTitle();

  return (
    <>
      {title}
      <h2 className="mb-6">Dashboard</h2>
      {/* <h3 className="mb-6">Welcome, {capitalizeText(userName)} !</h3> */}
      <DashboardSummary />
    </>
  );
};

export { UserDashboardPage };
