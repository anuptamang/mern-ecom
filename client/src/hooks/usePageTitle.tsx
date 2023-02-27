import { siteInfo } from 'configs/site';
import { Helmet } from 'react-helmet-async';
import { useLocation, useParams } from 'react-router-dom';
import { capitalizeText } from 'utils';

export const usePageTitle = () => {
  const { id } = useParams();
  const location = useLocation();

  let pathname: string = location.pathname.split('/')[1];

  if (!pathname) {
    pathname = 'Home';
  }

  if (pathname !== id) {
    pathname = capitalizeText(pathname);
  }

  return (
    <Helmet>
      <title>{`${pathname} | ${siteInfo.title}`}</title>
    </Helmet>
  );
};
