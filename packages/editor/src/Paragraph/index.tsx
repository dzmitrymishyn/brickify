import { match } from '@brickifyio/browser/hotkeys';
import { tap } from '@brickifyio/operators';
import * as A from 'fp-ts/lib/Array';
import { flow, pipe } from 'fp-ts/lib/function';
import { parseDocument } from 'htmlparser2';
import {
  type ElementType,
  forwardRef,
  type ReactNode,
  type RefObject,
  useCallback,
  useMemo,
  useRef,
} from 'react';

import { domToReactFactory } from './domToReactFactory';
import {
  type Component as BrickComponent,
  type BrickValue,
  type PropsWithBrick,
  type PropsWithChange,
} from '../bricks';
import { hasShortcuts } from '../bricks/utils/shortcuts';
import { useCommands } from '../core/commands';
import { useBrickContext } from '../core/hooks/useBrickContext';
import { useMutation } from '../core/mutations/useMutation';
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

  const emitNewValue = useCallback((element?: HTMLElement | null) => {
    const newHtml = element?.innerHTML ?? '&nbsp;';

    const formattedHtml = /^.&nbsp;$/.test(newHtml)
      ? newHtml[0]
      : newHtml;

    return onChange?.({
      type: 'update',
      value: formattedHtml === '<br>' ? '&nbsp;' : formattedHtml,
    });
  }, [onChange]);

  const mutationRef: RefObject<HTMLElement> = useMutation(({ remove }) => {
    if (remove) {
      return onChange?.({ type: 'remove' });
    }

    return emitNewValue(mutationRef.current);
  });

  const commandRef = useCommands(flow(
    (options) => pipe(
      bricks,
      A.reduce(false, (hasDomChanges, brick) => {
        if (!hasShortcuts(brick)) {
          return hasDomChanges;
        }

        return Object
          .values(brick.commands)
          .reduce((hasNewDomChanges, { handle, shortcuts }) => {
            const hasMatch = handle && shortcuts?.some(
              (shortcut) => match(options.event, shortcut),
            );

            if (hasMatch) {
              return handle(options);
            }

            return hasNewDomChanges;
          }, hasDomChanges);
      }),
    ),
    tap(() => emitNewValue(mutationRef.current)),
  ));

  const ref = useMergedRefs(mutationRef, commandRef, refProp, rootRef);

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
