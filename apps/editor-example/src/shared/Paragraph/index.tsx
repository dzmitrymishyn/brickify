'use client';

import { parseDocument } from 'htmlparser2';
import React, {
  ElementType,
  forwardRef,
  ReactNode,
  RefObject,
  useMemo,
  useRef,
} from 'react';

import {
  Component as BrickComponent,
  PropsWithBrick,
  PropsWithChange,
} from '@/shared/bricks/brick';

import { domToReactFactory } from './domToReactFactory';
import { BrickValue, useMutation } from '../bricks';
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

  const mutationRef: RefObject<HTMLElement> = useMutation({
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
      }, { oldValue: brick?.value, type: 'update' as any });
    },
  } as any);

  const ref = useMergedRefs(mutationRef, refProp);

  // eslint-disable-next-line react/jsx-no-useless-fragment
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
