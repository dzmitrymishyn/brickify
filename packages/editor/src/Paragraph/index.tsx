import { isText } from '@brickifyio/browser/utils';
import {
  type BrickValue,
  type Component,
  extend,
  type PropsWithStoredValue,
  useRendererRegistry,
  withMatcher,
  withName,
} from '@brickifyio/renderer';
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

type Props =
  & Partial<PropsWithStoredValue<Value>>
  & PropsWithChange<Value>
  & {
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
      data-brick={brickRecord?.name ?? 'Paragraph'}
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
  withMatcher((node) => node instanceof HTMLElement
    ? node.matches('*')
    : isText(node)),
  withName('Paragraph'),
);
