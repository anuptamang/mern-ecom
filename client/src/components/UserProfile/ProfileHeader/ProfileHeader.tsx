import { UserOutlined } from '@ant-design/icons';
import { Avatar, Upload, UploadProps } from 'antd';
import { LinkButton } from 'components/UI';
import { pageRoutes } from 'data/static/pageRoutes';
import { useLocation, useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const { hash } = useLocation();
  const action = hash?.slice(1);

  const props: UploadProps = {
    action: '//jsonplaceholder.typicode.com/posts/',
    listType: 'picture',
    previewFile(file) {
      console.log('Your upload file:', file);
      // Your process logic. Here we just mock to the same file
      return fetch('https://next.json-generator.com/api/json/get/4ytyBoLK8', {
        method: 'POST',
        body: file,
      })
        .then((res) => res.json())
        .then(({ thumbnail }) => {
          console.log(thumbnail);
          return thumbnail;
        });
    },
  };
  return (
    <div className="md:flex md:justify-between md:items-center relative z-20 -mt-[40px]">
      <div className="left flex items-center gap-5 md:max-w-[70%]">
        <Upload
          className="group avatar-holder relative rounded-full overflow-hidden w-[180px] h-[180px]  bg-blue-800 cursor-pointer after:content-[''] after:absolute after:left-0 after:right-0 after:w-full after:h-full after:rounded-full after:border-[5px] after:border-white after:border-solid after:z-10"
          {...props}
        >
          <Avatar size={180} src={profilePhotoUrl} icon={<UserOutlined />} />
          <div className="upload-label absolute bottom-0 left-0 right-0 px-2 pt-4 pb-7 bg-blue-600/50 text-white text-center group-hover:bg-blue-600">
            Update Photo
          </div>
        </Upload>
        <div className="description">
          <h2>{fullName}</h2>
        </div>
      </div>

      <div className="right md:max-w-[30%]">
        <ul className="list-none flex items-center gap-3">
          <li>
            <LinkButton type="primary" to="#update">
              Update
            </LinkButton>
          </li>
          {action === 'update' && (
            <li>
              <LinkButton type="link" to="#view">
                Cancel
              </LinkButton>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};
