import { getLastDeepLeaf } from '@brickifyio/browser/utils';
import {
  type AnyComponent,
  type BrickValue,
  extend,
  next,
  type PropsWithChange,
  useBrickContext,
  useBrickRegistry,
  useCommands,
  useMergedRefs,
  useMutation,
  withShortcuts,
} from '@brickifyio/core';
import { flow } from 'fp-ts/lib/function';
import { parseDocument } from 'htmlparser2';
import {
  type ElementType,
  type ReactNode,
  useMemo,
  useRef,
} from 'react';

import { domToReactFactory } from './domToReactFactory';
import assert from 'assert';

type Value = BrickValue & {
  value: string | number;
};

type Props = PropsWithChange<Value> & {
  bricks?: AnyComponent[];
  component?: ElementType;
  value: Value['value'];
  brick: object;
  style?: object;
};

const Paragraph: React.FC<Props> = ({
  value,
  bricks = [],
  component: Component = 'div',
  onChange,
  brick: brickProp,
  style,
}) => {
  const brick = brickProp as Value;
  const rootRef = useRef<HTMLElement>(null);
  const oldComponents = useRef<ReactNode>();
  const { editable } = useBrickContext();

  const { ref: brickRef } = useBrickRegistry(brick);
  const domToReact = useMemo(() => domToReactFactory(
    bricks,
    oldComponents,
  ), [bricks]);
  const components = useMemo(
    () => domToReact(parseDocument(`${value}`), 0),
    [value, domToReact],
  );

  const emitNewValue = flow(
    (element?: HTMLElement | null) => element?.innerHTML ?? '',
    (html) => html === '<br>' ? '' : html,
    (newValue) => onChange?.({ ...brick, value: newValue }, { brick }),
  );

  const ref = useMergedRefs(
    rootRef,
    brickRef,
    useCommands(bricks),
    useMutation(({ remove, target }) => {
      if (remove) {
        return onChange?.(brick, { type: 'remove', brick });
      }

      return emitNewValue(target as HTMLElement);
    }),
  );

  oldComponents.current = <>{components}</>;

  return (
    <Component
      data-brick="paragraph"
      ref={ref}
      style={style}
      {...editable && {
        contentEditable: true,
        suppressContentEditableWarning: true,
      }}
    >
      {/* <span> */}
      {components.length ? components : <br />}
      {/* </span>
      <span>
        {' '}
        <span
          role="button"
          tabIndex={-1}
          onKeyDown={() => null}
          style={{ background: '#efefef', fontStyle: 'italic' }}
          onClick={() => console.log(brick?.pathRef.current?.())}
        >
          {brick?.pathRef.current?.().join('/')}
        </span>
      </span> */}
    </Component>
  );
};

Paragraph.displayName = 'Paragraph';

export default extend(
  Paragraph,
  withShortcuts([
    {
      name: 'newLine',
      shortcuts: ['enter'],
      handle: ({ onChange, range, resultRange, getFromStore, descendants, stopBrickPropagation }) => {
        const currentRange = range();
        const target = descendants[0];

        assert(target, 'This handler should be called by it\'s parent and descendants should be defined');

        if (currentRange) {
          const cacheItem = getFromStore(target);
          assert(cacheItem, 'Cache item should exist');

          currentRange.extractContents();

          const tempDiv = document.createElement('div');
          const tempRange = new Range();
          tempRange.setStart(currentRange.startContainer, currentRange.startOffset);
          tempRange.setEnd(
            getLastDeepLeaf(target)!,
            getLastDeepLeaf(target)?.textContent?.length
              ?? getLastDeepLeaf(target)?.childNodes?.length
              ?? 0,
          );

          if (!tempRange.collapsed) {
            tempDiv.append(tempRange.extractContents());
          }

          const nextPath = next(cacheItem.pathRef.current());

          resultRange({
            start: { path: nextPath, offset: 0 },
            end: { path: nextPath, offset: 0 },
          });

          onChange?.({
            brick: 'Paragraph',
            id: Math.random().toFixed(3),
            // BR is a native browser behaviour to make an empty new line
            value: tempDiv.innerHTML ?? '',
          }, {
            type: 'add',
            path: nextPath,
          });

          stopBrickPropagation();
        }
      },
    },
  ]),
);
