import {
  type BrickValue,
  type Component,
  extend,
  type PropsWithStoredValue,
  useRendererRegistry,
  withName,
} from '@brickifyio/renderer';
import { compile } from 'css-select';
import { Node as DomhandlerNode } from 'domhandler';
import { pipe } from 'fp-ts/lib/function';
import { parseDocument } from 'htmlparser2';
import {
  type ElementType,
  type ReactNode,
  useMemo,
  useRef,
} from 'react';

import { domToReactFactory } from './domToReactFactory';
import { type PropsWithChange } from '../changes';
import { Commander } from '../commands';
import { useMutation } from '../mutations';

type Value = BrickValue & {
  value: string | number;
};

type Props = Partial<PropsWithStoredValue<Value>> & PropsWithChange<Value> & {
  components?: Component[];
  component?: ElementType;
  value: Value['value'];
  style?: object;
  editable?: boolean;
};

const Paragraph: React.FC<Props> = ({
  value,
  components = [],
  component: Component = 'div',
  onChange,
  stored: brickRecord = { value: { value: '' } },
  style,
  editable: editableProp = true,
}) => {
  const oldNodes = useRef<ReactNode>(null);
  // const { editable } = useBrickContext();
  const editable = editableProp;

  const ref = useRendererRegistry(brickRecord);

  const { markToRevert } = useMutation(ref, (mutation) => {
    markToRevert(mutation.mutations);

    if (mutation.removed) {
      return onChange?.(undefined);
    }

    return pipe(
      mutation.domNode as HTMLElement,
      (element?: HTMLElement | null) => element?.innerHTML ?? '',
      (html) => html === '<br>' ? '' : html,
      (newValue) => onChange?.({ value: newValue }),
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
      {...{
        contentEditable: editable,
        suppressContentEditableWarning: true,
      }}
    >
      <Commander containerRef={ref} components={components} />
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
  { is: (node: DomhandlerNode | Node) => {
    if (node instanceof DomhandlerNode) {
      return compile('*')(node);
    }

    if (node instanceof HTMLElement) {
      return node.matches('*');
    }

    return false;
  }},
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
