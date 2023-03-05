import { UploadOutlined } from '@ant-design/icons';
import { Button, Upload, UploadProps } from 'antd';
import { CoverPhoto } from 'components/UI/CoverPhoto';
import React from 'react';

type TProfileCover = {
  onCoverPhotoChange: (photoUrl: string) => void;
  coverPhotoUrl: string;
};

export const ProfileCover = ({
  onCoverPhotoChange,
  coverPhotoUrl,
}: TProfileCover) => {
  const handleChange = () => {
    onCoverPhotoChange('photoUrl');
  };

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
        .then(({ thumbnail }) => thumbnail);
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
