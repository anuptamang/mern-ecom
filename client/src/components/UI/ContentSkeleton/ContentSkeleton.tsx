import { Skeleton } from 'antd';

type TProps = {
  loading: boolean;
};

export const ContentSkeleton = ({ loading }: TProps) => {
  return <Skeleton loading={loading} active />;
};
