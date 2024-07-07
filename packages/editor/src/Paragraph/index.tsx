import { parseDocument } from 'htmlparser2';
import {
  type ElementType,
  forwardRef,
  type ReactNode,
  type RefObject,
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
  const oldComponents = useRef<ReactNode>();
  const { state } = useBrickContext();

  const domToReact = useMemo(() => domToReactFactory(
    bricks,
    oldComponents,
  ), [bricks]);
  const components = useMemo(
    () => domToReact(parseDocument(`${value}`), 0),
    [value, domToReact],
  );

  const mutationRef: RefObject<HTMLElement> = useMutation({
    mutate: ({ remove }) => {
      if (remove) {
        return onChange?.({ type: 'remove' });
      }

      // const newHtml = mutationRef.current?.children[0]?.innerHTML ?? '';
      const newHtml = mutationRef.current?.innerHTML ?? '';

      return onChange?.({
        type: 'update',
        value: newHtml,
      });
    },
  });

  // useCommands(() => console.log('handle'));

  const ref = useMergedRefs(mutationRef, refProp);

  oldComponents.current = <>{components}</>;

  return (
    <Component
      data-brick="paragraph"
      ref={ref}
      {...state().editable && {
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
