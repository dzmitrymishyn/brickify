import React from 'react';

import Strong from './Strong';
import { type BrickValue, type PropsWithBrick, type PropsWithChange } from '../bricks';
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
    <img
      src="https://placehold.co/400"
      alt="avatar"
      style={{ borderRadius: '50%', width: 50, height: 50 }}
    />
    <button
      type="button"
      onClick={() => {
        onChange?.({ ...brick.value, visible: !brick.value.visible }, {
          oldValue: brick.value,
          /* eslint @typescript-eslint/no-explicit-any: warn -- the type will be updated */
          /* eslint @typescript-eslint/no-unsafe-assignment: warn -- the type will be updated */
          type: 'update' as any,
        });
      }}
    >
      {brick.value.visible ? 'Hide' : 'Show'}
      {' '}
      description
    </button>
    {brick.value.visible ? <Paragraph
        value={children}
        bricks={[Strong]}
        onChange={(newValue: any) => {
          // eslint-disable-next-line -- make it safe
          onChange?.({ ...brick.value, children: newValue?.value ?? '' }, {
            oldValue: brick.value,
            /* eslint @typescript-eslint/no-explicit-any: warn -- the type will be updated */
            /* eslint @typescript-eslint/no-unsafe-assignment: warn -- the type will be updated */
            type: 'update' as any,
          });
        }}
      /> : null}
  </div>
);

Profile.displayName = 'Profile';

export default Profile;
