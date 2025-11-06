'use client';

import { Card, Progress, theme } from 'antd';
import { ContentSkeleton } from '@/components';
import { pageRoutes } from '@/data/static/pageRoutes';
import Link from 'next/link';
import { useAppSelector } from '@/redux/store';
import { authSelector } from '@/redux/slice';

export const ProfileStatus = () => {
  const { result } = useAppSelector(authSelector);
  let completion = 0;
  if (result) {
    let filled = 0;
    if (result.fullName) filled++;
    if (result.email) filled++;
    if (result.profilePhoto) filled++;
    if (result.coverPhoto) filled++;
    completion = Math.round((filled / 4) * 100);
  }

  return (
    <Card
      className="w-full flex items-center flex-col [&_.ant-card-body]:flex-auto [&_.ant-card-body]:flex [&_.ant-card-body]:items-center [&_.ant-card-head]:w-full"
      title="Profile Completion"
    >
      <div className="text-center">
        <ContentSkeleton loading={false} />
        <Progress
          className="mb-2 text-center"
          type="circle"
          percent={completion}
          strokeColor={{
            '0%': theme.useToken().token.colorPrimary,
            '100%': theme.useToken().token.colorPrimaryBg,
          }}
        />
        <div className="text-center">
          <Link className="underline" href={`/${pageRoutes.userProfile}#update`}>
            Complete Now
          </Link>
        </div>
      </div>
    </Card>
  );
};
