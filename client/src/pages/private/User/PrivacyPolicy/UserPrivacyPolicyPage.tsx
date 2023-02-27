import { usePageTitle } from 'hooks/usePageTitle';

export const UserPrivacyPolicyPage = () => {
  const title = usePageTitle();

  return (
    <>
      {title}
      <h1>Private Privacy Policy</h1>
    </>
  );
};
