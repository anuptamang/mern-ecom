import { UploadOutlined } from '@ant-design/icons';
import { Button, Upload, UploadProps } from 'antd';
import { CoverPhoto } from '@/components/UI/CoverPhoto';

type TProfileCover = {
  onCoverPhotoChange: (file: File) => void;
  coverPhotoUrl: string;
};

export const ProfileCover = ({
  onCoverPhotoChange,
  coverPhotoUrl,
}: TProfileCover) => {
  const props: UploadProps = {
    name: 'thumbnail',
    accept: 'image/*',
    showUploadList: false,
    beforeUpload: (file) => {
      // Call the upload handler with the file
      onCoverPhotoChange(file);
      // Return false to prevent default upload
      return false;
    },
  };

  return (
    <div className="relative">
      <CoverPhoto coverPhotoUrl={coverPhotoUrl} />
      <div className="absolute right-5 bottom-5 z-[80]">
        <Upload {...props}>
          <Button icon={<UploadOutlined />}>Update Cover</Button>
        </Upload>
      </div>
    </div>
  );
};
