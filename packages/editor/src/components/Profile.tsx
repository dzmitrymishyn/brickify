import { forwardRef, useRef, useState } from 'react';

import Br from './Br';
import Strong from './Strong';
import {
  type BrickValue,
  type PropsWithBrick,
  type PropsWithChange,
  useBrickContext,
  useMutation,
} from '../core';
import Paragraph from '../Paragraph';
import { useMergedRefs } from '../utils';

type Value = BrickValue & {
  children: string | number;
  visible: boolean;
};

type Props =
  & PropsWithBrick<Value>
  & PropsWithChange
  & {
    children: string | number;
  };

const Profile = forwardRef<HTMLDivElement, Props>(
  ({ children, onChange, brick }, refProp) => {
    const { editable } = useBrickContext();
    const internalRef = useRef<HTMLDivElement>();

    const [isDescriptionVisible, setIsDescriptionVisible] = useState(
      brick?.visible,
    );

    const visible = editable
      ? brick?.visible
      : isDescriptionVisible;

    const mutationRef = useMutation<HTMLDivElement>(({ remove }) => {
      if (remove) {
        return onChange?.({ type: 'remove' });
      }
    });

    const ref = useMergedRefs(refProp, internalRef, mutationRef);

    return (
      <div
        ref={ref}
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
            if (editable) {
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
          bricks={[Strong, Br]}
          onChange={(newValue) => {
            return onChange?.({
              children: newValue.type === 'update' ? newValue.value ?? '' : '',
              type: 'update',
            });
          }
        }
        /> : null}
      </div>
    );
  },
);

Profile.displayName = 'Profile';

export default Profile;
