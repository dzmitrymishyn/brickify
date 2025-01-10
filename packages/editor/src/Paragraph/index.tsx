import { reduceLeavesRight } from '@brickifyio/browser/traverse';
import { isBr, isText } from '@brickifyio/browser/utils';
import {
  type BrickValue,
  type Component,
  extend,
  getName,
  type PropsWithStoredValue,
  useRendererRegistry,
  withMatcher,
  withName,
  withNodeToBrick,
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
import { ContainerHooks } from '../ContainerHooks';
import { useMutation } from '../mutations';

export type ParagraphResults = {
  paragraph: {
    leftCornerNode: Node;
    text: string;
  };
};

type Value = BrickValue & {
  value: string | number;
};

type Props =
  & PropsWithStoredValue<Value>
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
  stored: brickRecord,
  style,
  editable: editableProp = true,
}) => {
  const oldNodes = useRef<ReactNode>(null);
  // const { editable } = useBrickContext();
  const editable = editableProp;

  const ref = useRendererRegistry<HTMLElement>(brickRecord ?? {});

  const { markToRevert } = useMutation<ParagraphResults>(
    ref,
    ({ domNode, mutations, removed, range, results }) => {
      markToRevert(mutations);

      if (removed) {
        return onChange?.(undefined);
      }

      if (range?.collapsed) {
        const lastNodeText = isText(range.startContainer)
          ? range.startContainer.textContent?.slice(0, range.startOffset + 1) ?? ''
          : '';
        const paragraph = reduceLeavesRight<{ text: string; leftCornerNode: Node }>(
          { text: lastNodeText, leftCornerNode: range.startContainer },
          domNode,
          range.startContainer,
          (acc, current) => {
            if (acc.text.length > 256 || range.startContainer === current) {
              return acc;
            }

            if (isText(current)) {
              return {
                leftCornerNode: current,
                text: `${current.textContent ?? ''}${acc.text}`,
              };
            }

            if (isBr(current)) {
              return {
                leftCornerNode: current,
                text: `\n${acc.text}`,
              };
            }

            return acc;
          }
        );

        results({ paragraph });
      }

      return pipe(
        domNode as HTMLElement,
        (element?: HTMLElement | null) => element?.innerHTML ?? '',
        (html) => html === '<br>' ? '' : html,
        (newValue) => onChange?.({ value: newValue }),
      );
    },
  );

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
      <ContainerHooks containerRef={ref} components={components} />
      <ContainerHooks
        containerRef={ref}
        components={brickRecord?.components}
      />
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
  withNodeToBrick((node, { component }) => {
    let value = '';
    if (node instanceof HTMLElement) {
      value = node.innerHTML || node.innerText || '';
    }

    if (isText(node)) {
      value = node.textContent || '';
    }

    return {
      brick: getName(component),
      value,
      id: Math.random().toFixed(5),
    };
  }),
  withName('Paragraph'),
);
