import { Helmet } from 'react-helmet-async';

export const UserSettingsPage = () => {
  return (
    <>
      <Helmet>
        <title>User UserSettings | My App</title>
      </Helmet>
      <div>
        <div>
          User Type: Buyer/Seller <br></br> | Buyer && show seller registration
          btn
        </div>
        <div>Store theme: Auto/Light/Dark | show theme togglers</div>
      </div>
    </>
  );
};
