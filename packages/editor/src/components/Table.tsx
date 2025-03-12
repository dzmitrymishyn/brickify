import { isElement } from '@brickifyio/browser/utils';
import {
  applySlots,
  type BrickValue,
  extend,
  getName,
  hasProps,
  type PropsWithStoredValue,
  useRendererRegistry,
  withMatcher,
  withName,
  withNodeToBrick,
} from '@brickifyio/renderer';
import { useRef } from 'react';

import { type PropsWithChange } from '../changes';
import { useEditorRenderer } from '../hooks/useEditorRenderer';
import { useMutation } from '../mutations';
import Paragraph from '../Paragraph';

type TableRowProps = PropsWithStoredValue<string[]> & {
  value: string[];
} & PropsWithChange<string>;

const TableRow: React.FC<TableRowProps> = ({ stored, value, onChange }) => {
  const ref = useRendererRegistry<HTMLTableRowElement>(stored);
  const components = applySlots([
    ['TableColumn', 'Paragraph', Paragraph, { component: 'td', style: { padding: 8, width: '33.3333%', border: '1px solid #ccc' } }],
  ], stored?.components);

  const nodes = useEditorRenderer({
    value,
    components,
    pathPrefix: () => [],
    render(columnValue, options) {
      const index = options.pathRef.current().pop();

      if (typeof columnValue !== 'string' || !index) {
        return null;
      }

      const Component = options.components.TableColumn;
      const pathPrefix = [index];

      return (
        <Component
          {...hasProps(Component) ? Component.props : {}}
          value={columnValue}
          stored={{
            name: 'TableColumn',
            components: options.components,
            pathRef: {
              current: () => [...stored.pathRef.current(), ...pathPrefix],
            },
            value: { value: columnValue },
          }}
          key={index}
          onChange={(event?: { value: string }) => {
            onChange?.(event?.value, pathPrefix);
          }}
        />
      );
    },
  });
  return (
    <tr ref={ref}>
      {nodes}
    </tr>
  );
};

type Props = PropsWithStoredValue<BrickValue & { children: string[][] }>
  & PropsWithChange;

const Table: React.FC<Props> = ({ stored, children, onChange }) => {
  const ref = useRendererRegistry<HTMLTableElement>(stored);
  const tbodyRef = useRef(null);

  const nodes = useEditorRenderer({
    value: children,
    components: stored.components,
    pathPrefix: () => ['children'],
    render(value, options) {
      const index = options.pathRef.current().at(-1);

      if (!Array.isArray(value) || !index) {
        return null;
      }

      const pathPrefix = ['children', index];

      return (
        <TableRow
          key={index}
          stored={{
            name: 'TableRow',
            components: options.components,
            pathRef: {
              current: () => [...stored.pathRef.current(), ...pathPrefix],
            },
            value: value as string[],
          }}
          value={value}
          onChange={(event, columnIndex) => {
            onChange?.(event, [...pathPrefix, ...columnIndex ?? []]);
          }}
        />
      );
    },
  });

  useMutation(ref, ({ removed }) => {
    if (removed) {
      onChange?.(undefined);
    }
  });

  return (
    <table ref={ref} style={{ width: '100%' }}>
      <tbody ref={tbodyRef}>
        {nodes}
      </tbody>
    </table>
  );
};

export default extend(
  Table,
  withName('Table'),
  withMatcher((node) => isElement(node) && node.matches('table')),
  withNodeToBrick((node, { component }) => {
    if (!(node instanceof HTMLTableElement)) {
      return null;
    }

    return {
      id: Math.random().toFixed(5),
      brick: getName(component),
      children: Array.from(node.querySelector('tbody')?.childNodes ?? []).map(
        (childNode) => isElement(childNode)
          ? (childNode.innerHTML || childNode.textContent)
          : '',
      ),
    };
  }),
);
