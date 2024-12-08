import {
  type BrickStoreValue,
  type BrickValue,
  type Component,
  extend,
  type PropsWithChange,
} from '@brickifyio/core';
import { type PropsWithStoredValue, useRendererRegistry, withName } from '@brickifyio/renderer';
import { pipe } from 'fp-ts/lib/function';
import { parseDocument } from 'htmlparser2';
import {
  type ElementType,
  type ReactNode,
  useMemo,
  useRef,
} from 'react';

import { domToReactFactory } from './domToReactFactory';
import { useMutation } from '../mutations';

type Value = BrickValue & {
  value: string | number;
};

type Props = PropsWithStoredValue & PropsWithChange<Value> & {
  components?: Component[];
  component?: ElementType;
  value: Value['value'];
  brick: BrickStoreValue;
  style?: object;
};

const Paragraph: React.FC<Props> = ({
  value,
  components = [],
  component: Component = 'div',
  // onChange,
  stored,
  style,
}) => {
  // const ref = useRef<HTMLElement>(null);
  const oldNodes = useRef<ReactNode>(null);
  // const { editable } = useBrickContext();
  const editable = true;
  // const change = useChange(stored as any, onChange);

  // const ref = useMergedRefs(
  //   rootRef,
  //   useCommands(bricks),
  // );
  const ref = useRendererRegistry(stored);

  const { markToRevert } = useMutation(ref, (mutation) => {
    markToRevert(mutation.mutations);

    if (mutation.removed) {
      // return change({ type: 'remove' });
      return;
    }

    return pipe(
      mutation.domNode as HTMLElement,
      (element?: HTMLElement | null) => element?.innerHTML ?? '',
      (html) => html === '<br>' ? '' : html,
      // (newValue) => change({ value: { value: newValue } }),
    );
  });

  const domToReact = useMemo(() => domToReactFactory(
    components,
    oldNodes,
  ), [components]);
  const nodes = useMemo(
    () => domToReact(parseDocument(`${value}`), 0),
    [value, domToReact],
  );

  oldNodes.current = <>{nodes}</>;

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
      {nodes.length ? nodes : <br />}
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

export default extend(
  Paragraph,
  withName('Paragraph'),
  // withShortcuts([
  //   {
  //     name: 'newLine',
  //     shortcuts: ['enter'],
  //     handle: ({ onChange, range, resultRange, getFromStore, descendants, stopBrickPropagation }) => {
  //       const currentRange = range();
  //       const target = descendants[0];

  //       assert(target, 'This handler should be called by it\'s parent and descendants should be defined');

  //       if (currentRange) {
  //         const cacheItem = getFromStore(target);
  //         assert(cacheItem, 'Cache item should exist');

  //         currentRange.extractContents();

  //         const tempDiv = document.createElement('div');
  //         const tempRange = new Range();
  //         tempRange.setStart(currentRange.startContainer, currentRange.startOffset);
  //         tempRange.setEnd(
  //           getLastDeepLeaf(target)!,
  //           getLastDeepLeaf(target)?.textContent?.length
  //             ?? getLastDeepLeaf(target)?.childNodes?.length
  //             ?? 0,
  //         );

  //         if (!tempRange.collapsed) {
  //           tempDiv.append(tempRange.extractContents());
  //         }

  //         const nextPath = next(cacheItem.pathRef.current());

  //         resultRange({
  //           start: { path: nextPath, offset: 0 },
  //           end: { path: nextPath, offset: 0 },
  //         });

  //         onChange?.({
  //           type: 'add',
  //           path: nextPath,
  //           value: {
  //             brick: 'Paragraph',
  //             id: Math.random().toFixed(3),
  //             // BR is a native browser behaviour to make an empty new line
  //             value: tempDiv.innerHTML ?? '',
  //           },
  //         });

  //         stopBrickPropagation();
  //       }
  //     },
  //   },
  // ]),
);
