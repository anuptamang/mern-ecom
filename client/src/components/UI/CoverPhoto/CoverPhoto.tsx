import React from 'react';

export const CoverPhoto = ({ coverPhotoUrl }: { coverPhotoUrl: string }) => {
  return (
    <div className="relative overflow-auto h-[230px] bg-brand-gradient rounded-xl">
      {coverPhotoUrl && (
        <img
          className="absolute inset-0 w-full h-full object-cover"
          src={coverPhotoUrl}
          alt="cover"
        />
      )}
    </div>
  );
};
