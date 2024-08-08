import {
  type BrickValue,
  type PropsWithBrick,
  type PropsWithChange,
  useBrickContext,
  useBrickRegistry,
  useMergedRefs,
  useMutation,
} from '@brickifyio/core';
import { forwardRef, useRef, useState } from 'react';

import Br from './Br';
import Strong from './Strong';
import Paragraph from '../Paragraph';

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
    const {
      ref: brickRegistryRef,
      useBrickChildRegistry,
    } = useBrickRegistry(brick);
    const paragraphBrick = useBrickChildRegistry('content', {});
    const internalRef = useRef<HTMLDivElement>();

    const [isDescriptionVisible, setIsDescriptionVisible] = useState(
      brick?.visible,
    );

    const visible = editable
      ? brick?.visible
      : isDescriptionVisible;

    const mutationRef = useMutation<HTMLDivElement>(({ remove }) => {
      if (remove) {
        return onChange?.(null, { type: 'remove', brick });
      }
    });

    const ref = useMergedRefs(brickRegistryRef, refProp, internalRef, mutationRef);

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
              onChange?.({ ...brick, visible: !visible }, {
                type: 'update',
                brick,
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
          brick={paragraphBrick}
          bricks={[Strong, Br]}
          onChange={(newValue, { type }) => {
            return onChange?.({
              ...brick,
              children: type ==='update' ? newValue : '',
            }, { type: 'update', brick });
          }
        }
        /> : null}
      </div>
    );
  },
);

Profile.displayName = 'Profile';

export default Profile;
