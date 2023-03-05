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

  return (
    <div className="relative">
      <CoverPhoto coverPhotoUrl={coverPhotoUrl} />
      <div className="absolute right-5 bottom-5 z-10">Change Cover Photo</div>
    </div>
  );
};
