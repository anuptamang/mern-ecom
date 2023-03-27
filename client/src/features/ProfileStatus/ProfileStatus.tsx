import { Card, Progress, theme } from 'antd';
import { ContentSkeleton } from 'components';
import { pageRoutes } from 'data/static/pageRoutes';
import { Link } from 'react-router-dom';

export const ProfileStatus = () => {
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
          percent={70}
          strokeColor={{
            '0%': theme.useToken().token.colorPrimary,
            '100%': theme.useToken().token.colorPrimaryBg,
          }}
        />
        <div className="text-center">
          <Link className="underline" to={`/${pageRoutes.userProfile}#update`}>
            Complete Now
          </Link>
        </div>
      </div>
    </Card>
  );
};
