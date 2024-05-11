import React, { PropsWithChildren, useState } from 'react';

import { extend, slots } from '@/shared/bricks';

const Profile: React.FC<PropsWithChildren> = ({ children }) => {
  const [showDescription, setShowDescription] = useState(true);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
      }}
      contentEditable={false}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://placehold.co/400"
        alt="avatar"
        style={{ borderRadius: '50%', width: 50, height: 50 }}
      />
      <button
        type="button"
        onClick={() => setShowDescription((oldState) => !oldState)}
      >
        {showDescription ? 'Hide' : 'Show'}
        {' '}
        description
      </button>
      {showDescription && (
        <div contentEditable suppressContentEditableWarning>
          {children}
        </div>
      )}
    </div>
  );
};

Profile.displayName = 'Profile';

export default extend(
  Profile,
  slots({ children: 'inherit' }),
);
