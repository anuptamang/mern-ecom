import { UserOutlined } from '@ant-design/icons';
import { Avatar, Upload, UploadProps } from 'antd';

type TProfileHeader = {
  onProfilePhotoChange: (file: File) => void;
  profilePhotoUrl: string;
  fullName: string;
};

export const ProfileHeader = ({
  onProfilePhotoChange,
  profilePhotoUrl,
  fullName,
}: TProfileHeader) => {

  const props: UploadProps = {
    name: 'thumbnail',
    accept: 'image/*',
    showUploadList: false,
    beforeUpload: (file) => {
      // Call the upload handler with the file
      onProfilePhotoChange(file);
      // Return false to prevent default upload
      return false;
    },
  };
  return (
    <div className="md:flex md:justify-between md:items-center relative z-20 -mt-[40px]">
      <div className="left flex items-center gap-5 md:max-w-[70%]">
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <style>{`
            .avatar-holder .ant-upload {
              display: block !important;
            }
            .avatar-holder .ant-upload > span {
              display: block !important;
              width: 180px !important;
              height: 180px !important;
              position: relative !important;
            }
            .avatar-holder input[type="file"] {
              position: absolute !important;
              width: 100% !important;
              height: 100% !important;
              opacity: 0 !important;
              cursor: pointer !important;
              z-index: 100 !important;
            }
          `}</style>
          <Upload {...props} className="avatar-holder">
            <div
              className="group relative rounded-full overflow-hidden w-[180px] h-[180px] bg-blue-800 cursor-pointer"
              style={{ position: 'relative' }}
            >
              <Avatar
                size={180}
                src={profilePhotoUrl}
                icon={<UserOutlined />}
              />
              <div className="upload-label absolute bottom-0 left-0 right-0 px-2 pt-4 pb-7 bg-blue-600/50 text-white text-center group-hover:bg-blue-600 pointer-events-none z-20">
                Update Photo
              </div>
              <div className="absolute inset-0 border-[5px] border-white border-solid rounded-full pointer-events-none z-10"></div>
            </div>
          </Upload>
        </div>
        <div className="description">
          <h2>{fullName}</h2>
        </div>
      </div>
    </div>
  );
};
