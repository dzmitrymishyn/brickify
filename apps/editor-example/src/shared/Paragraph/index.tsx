'use client';

import { parseDocument } from 'htmlparser2';
import React, {
  type ElementType,
  forwardRef,
  type ReactNode,
  type RefObject,
  useMemo,
  useRef,
} from 'react';

import {
  type Component as BrickComponent,
  type PropsWithBrick,
  type PropsWithChange,
} from '@/shared/bricks/brick';

import { domToReactFactory } from './domToReactFactory';
import { type BrickValue, useMutation } from '../bricks';
import useMergedRefs from '../Editor/useMergedRef';

type Value = BrickValue & {
  value: string | number;
};

type Props = PropsWithChange<Value> & Partial<PropsWithBrick<Value>> & {
  bricks?: BrickComponent[];
  component?: ElementType;
  value: Value['value'];
};

const Paragraph = forwardRef<HTMLElement, Props>(({
  value,
  bricks = [],
  component: Component = 'div',
  brick,
  onChange,
}, refProp) => {
  const oldComponents = useRef<ReactNode>();

  const domToReact = useMemo(() => domToReactFactory(
    bricks,
    oldComponents,
  ), [bricks]);
  const components = useMemo(
    () => domToReact(parseDocument(`${value}`), 0),
    [value, domToReact],
  );

  // eslint-disable-next-line -- TODO: check it
  const mutationRef: RefObject<HTMLElement> = useMutation({
    // eslint-disable-next-line -- TODO: check it
    mutate: ({ remove }: any) => {
      if (remove) {
        return onChange?.(null, { type: 'remove' });
      }

      // const newHtml = mutationRef.current?.children[0]?.innerHTML ?? '';
      const newHtml = mutationRef.current?.innerHTML ?? '';

      return onChange?.({
        id: null,
        brick: 'Paragraph',
        ...brick?.value,
        value: newHtml,
        // eslint-disable-next-line -- TODO: check it
      }, { oldValue: brick?.value, type: 'update' as any });
    },
  // eslint-disable-next-line -- TODO: check it
  } as any);

  const ref = useMergedRefs(mutationRef, refProp);


  oldComponents.current = <>{components}</>;

  return (
    <Component
      data-brick="paragraph"
      ref={ref}
      contentEditable
      suppressContentEditableWarning
    >
      {/* <span> */}
      {components}
      {/* </span> */}
      {/* <span>
        {' '}
        <span
          style={{ background: '#efefef', fontStyle: 'italic' }}
          onClick={() => console.log(brick?.path())}
        >
          {brick?.path().join('/')}
        </span>
      </span> */}
    </Component>
  );
});

Paragraph.displayName = 'Paragraph';

export default Paragraph;
