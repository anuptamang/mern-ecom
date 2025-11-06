'use client';

import { siteData } from '@/configs/site';
import { Helmet } from 'react-helmet-async';
import { usePathname } from 'next/navigation';
import { capitalizeText } from '@/utils';

export const usePageTitle = () => {
  const pathname = usePathname();

  let pageName: string = pathname.split('/').filter(Boolean)[0] || 'home';

  if (!pageName) {
    pageName = 'Home';
  }

  pageName = capitalizeText(pageName);

  return (
    <Helmet>
      <title>{`${pageName} | ${siteData.site.title}`}</title>
    </Helmet>
  );
};
