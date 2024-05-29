import React from 'react';

import Strong from './Strong';
import { BrickValue, PropsWithBrick, PropsWithChange } from '../bricks';
import Paragraph from '../Paragraph';

type Value = BrickValue & {
  children: string | number;
  visible: boolean;
};

type Props =
  & PropsWithBrick<Value>
  & PropsWithChange<Value>
  & {
    children: string | number;
  };

const Profile: React.FC<Props> = ({ children, brick, onChange }) => (
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
      onClick={() => {
        onChange?.({ ...brick.value, visible: !brick.value?.visible }, {
          oldValue: brick.value,
          type: 'update' as any,
        });
      }}
    >
      {brick.value.visible ? 'Hide' : 'Show'}
      {' '}
      description
    </button>
    {brick.value.visible && (
      <Paragraph
        value={children}
        bricks={[Strong]}
        onChange={(newValue) => {
          onChange?.({ ...brick.value, children: newValue?.value ?? '' }, {
            oldValue: brick.value,
            type: 'update' as any,
          });
        }}
      />
    )}
  </div>
);

Profile.displayName = 'Profile';

export default Profile;
