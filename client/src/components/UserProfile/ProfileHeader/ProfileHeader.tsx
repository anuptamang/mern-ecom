import { UserOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
import { LinkButton } from 'components/UI';
import { pageRoutes } from 'data/static/pageRoutes';

type TProfileHeader = {
  onProfilePhotoChange: (photoUrl: string) => void;
  profilePhotoUrl: string;
  fullName: string;
};

export const ProfileHeader = ({
  onProfilePhotoChange,
  profilePhotoUrl,
  fullName,
}: TProfileHeader) => {
  const handlePhotoChange = () => {
    onProfilePhotoChange('photoUrl');
  };
  return (
    <div className="md:flex md:justify-between">
      <div className="left flex items-center gap-5">
        <div className="group avatar-holder relative rounded-full overflow-hidden w-[150px] h-[150px] border-[5px] border-white bg-brand-gradient cursor-pointer">
          <Avatar size={150} src={profilePhotoUrl} icon={<UserOutlined />} />
          <div className="upload-label absolute bottom-0 left-0 right-0 px-2 py-6 bg-black-600/50 text-white text-center">
            Update Photo
          </div>
        </div>
        <div className="description">
          <h2>{fullName}</h2>
        </div>
      </div>
      <div className="right">
        <ul className="list-none flex items-center gap-3">
          <li>
            <LinkButton type="primary" to={`/${pageRoutes.userProfile}/update`}>
              Update
            </LinkButton>
          </li>
        </ul>
      </div>
    </div>
  );
};
