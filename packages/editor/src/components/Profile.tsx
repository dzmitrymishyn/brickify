import React, { useState } from 'react';

import Strong from './Strong';
import { type BrickValue, type PropsWithBrick, type PropsWithChange } from '../bricks';
import { useBrickContext, useMutation } from '../core';
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

const Profile: React.FC<Props> = ({ children, brick, onChange }) => {
  const { state } = useBrickContext();
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(
    brick.value.visible,
  );

  const visible = state().editable
    ? brick.value.visible
    : isDescriptionVisible;

  const mutationRef = useMutation<HTMLDivElement>({
    mutate: ({ remove }) => {
      if (remove) {
        return onChange?.({ type: 'remove' });
      }
    },
  });

  return (
    <div
      ref={mutationRef}
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
          if (state().editable) {
            onChange?.({
              type: 'update',
              visible: !visible,
            });
          } else {
            setIsDescriptionVisible((oldValue) => !oldValue);
          }
        }}
      >
        {visible ? 'Hide' : 'Show'}
        {' '}
        description
      </button>
      {visible ? <Paragraph
        value={children}
        bricks={[Strong]}
        onChange={(newValue) => onChange?.({
          children: newValue.type === 'update' ? newValue.value ?? '' : '',
          type: 'update',
        })}
      /> : null}
    </div>
  );
};

Profile.displayName = 'Profile';

export default Profile;
