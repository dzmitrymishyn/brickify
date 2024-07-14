import { isElementWithinRange } from '@brickifyio/browser/selection';
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
  type Component as BrickComponent,
  type BrickValue,
  extend,
  type PropsWithBrick,
  type PropsWithChange,
  useBrickContext,
  useMutation,
  withShortcuts,
} from '../core';
import { useCommands } from '../core/commands';
import { useMergedRefs } from '../utils';

type Value = BrickValue & {
  value: string | number;
};

type Props = PropsWithChange & Partial<PropsWithBrick<Value>> & {
  bricks?: BrickComponent[];
  component?: ElementType;
  value: Value['value'];
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
      })
    ),
    [onChange, value],
  );

  const ref = useMergedRefs(
    rootRef,
    refProp,
    useMutation(({ remove, target }) => {
      if (remove) {
        return onChange?.({ type: 'remove' });
      }

      return emitNewValue(target as HTMLElement);
    }),
    useCommands(bricks),
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
  withShortcuts({
    newLine: {
      shortcuts: ['enter'],
      handle: ({ onChange, element, range }) => {
        const currentRange = range();

        if (currentRange && isElementWithinRange(element, currentRange)) {
          onChange?.({
            type: 'add',
            ...{
              path: ['children', '2'],
              value: {
                brick: 'Paragraph',
                id: Math.random(),
                value: 'test',
              },
            },
          });
        }
      }
    },
  }),
);
