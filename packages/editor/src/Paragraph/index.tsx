import { getLastDeepLeaf } from '@brickifyio/browser/utils';
import { pipe } from 'fp-ts/lib/function';
import { parseDocument } from 'htmlparser2';
import {
  type ElementType,
  forwardRef,
  type ReactNode,
  useCallback,
  useMemo,
  useRef,
} from 'react';

import { domToReactFactory } from './domToReactFactory';
import {
  type AnyComponent,
  type BrickValue,
  extend,
  type PropsWithChange,
  useBrickContext,
  useMutation,
  withShortcuts,
} from '../core';
import { useCommands } from '../core/commands';
import { next } from '../core/utils/path';
import { useMergedRefs } from '../utils';
import assert from 'assert';

type Value = BrickValue & {
  value: string | number;
};

type Props = PropsWithChange & {
  bricks?: AnyComponent[];
  component?: ElementType;
  value: Value['value'];
  brick: object;
};

const Paragraph = forwardRef<HTMLElement, Props>(({
  value,
  bricks = [],
  component: Component = 'div',
  onChange,
}, refProp) => {
  const rootRef = useRef<HTMLElement>(null);
  const oldComponents = useRef<ReactNode>();
  const { editable } = useBrickContext();

  const domToReact = useMemo(() => domToReactFactory(
    bricks,
    oldComponents,
  ), [bricks]);
  const components = useMemo(
    () => domToReact(parseDocument(`${value}`), 0),
    [value, domToReact],
  );

  const emitNewValue = useCallback(
    (element?: HTMLElement | null) => pipe(
      element?.innerHTML ?? '&nbsp;',
      (html) => /^.&nbsp;$/.test(html) ? html[0] : html,
      (html) => html === '<br>' ? '&nbsp;' : html,
      (newValue) => newValue === value ? undefined : onChange?.({
        value: newValue,
        type: 'update',
      })
    ),
    [onChange, value],
  );

  const ref = useMergedRefs(
    rootRef,
    refProp,
    useCommands(bricks),
    useMutation(({ remove, target }) => {
      if (remove) {
        return onChange?.({ type: 'remove' });
      }

      return emitNewValue(target as HTMLElement);
    }),
  );

  oldComponents.current = <>{components}</>;

  return (
    <Component
      data-brick="paragraph"
      ref={ref}
      {...editable && {
        contentEditable: true,
        suppressContentEditableWarning: true,
      }}
    >
      {/* <span> */}
      {components}
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
});

Paragraph.displayName = 'Paragraph';

export default extend(
  Paragraph,
  withShortcuts([
    {
      name: 'newLine',
      shortcuts: ['enter'],
      handle: ({ onChange, range, cache, results, descendants }) => {
        const currentRange = range();
        const target = descendants[0];

        assert(target, 'This handler should be called by it\'s parent and descendants should be defined');

        if (currentRange) {
          const cacheItem = cache(target);
          assert(cacheItem, 'Cache item should exist');

          currentRange.extractContents();
          results({ stop: true });

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

          onChange?.({
            type: 'add',
            path: next(cacheItem.pathRef.current()),
            value: {
              brick: 'Paragraph',
              id: Math.random(),
              // BR is a native browser behaviour to make an empty new line
              value: tempDiv.innerHTML || '<br>',
            },
          });
        }
      }
    },
  ]),
);
