import { getFirstDeepLeaf, isElement } from '@brickifyio/browser/utils';
import {
  applySlots,
  type BrickValue,
  cloneOrCreateElement,
  extend,
  getName,
  hasProps,
  type PropsWithStoredValue,
  usePrimitiveChildrenCache,
  useRenderer,
  useRendererContext,
  useRendererRegistry,
  withName,
} from '@brickifyio/renderer';
import { useRef } from 'react';

import { type PropsWithChange } from '../changes';
import { useCommand } from '../commands';
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
  const { store } = useRendererContext();
  const cache = usePrimitiveChildrenCache();

  const nodes = useRenderer({
    value,
    components,
    pathPrefix: () => [...stored.pathRef.current()],
    render(columnValue, options) {
      const index = options.pathRef.current().pop();

      if (typeof columnValue !== 'string'  || !index) {
        return null;
      }

      const Component = options.components.TableColumn;
      const pathPrefix = [index];
      const cachedValue = cache.get(index, options.previousValue);

      return cloneOrCreateElement(
        store.get<{ value: string }>(cachedValue),
        () => cachedValue?.value === columnValue,
        <Component
          {...hasProps(Component) ? Component.props : {}}
          value={columnValue}
          stored={{
            name: getName(Component),
            components: options.components,
            pathRef: {
              current: () => pathPrefix,
            },
            value: cache.save(index, columnValue),
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

  const { store } = useRendererContext();
  const nodes = useRenderer({
    value: children,
    components: stored.components,
    pathPrefix: () => [...stored.pathRef.current(), 'children'],
    render(value, options) {
      const index = options.pathRef.current().at(-1);

      if (!Array.isArray(value) || !index) {
        return null;
      }

      const pathPrefix = ['children', index];

      return cloneOrCreateElement(
        store.get<string[]>(options.previousValue),
        (oldValue) => oldValue === value,
        <TableRow
          key={index}
          stored={{
            name: 'TableRow',
            components: options.components,
            pathRef: {
              current: () => pathPrefix,
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

  useCommand(ref, {
    shortcuts: ['tab'],
    name: 'nextColumn',
    handle: ({ originalEvent, descendants, range }) => {
      const target = descendants.at(-1);
      const nearestTd = isElement(target)
        ? target.closest('td')
        : target?.parentElement?.closest('td');

      if (nearestTd?.nextSibling) {
        originalEvent.preventDefault();
        const node = getFirstDeepLeaf(nearestTd.nextSibling)
          ?? nearestTd.nextSibling;
        range.setStart(node, 0);
        range.setEnd(node, 0);
        return;
      }

      if (nearestTd?.parentElement?.nextSibling) {
        originalEvent.preventDefault();
        const node = getFirstDeepLeaf(nearestTd.parentElement.nextSibling)
          ?? nearestTd.parentElement.nextSibling;
        range.setStart(node, 0);
        range.setEnd(node, 0);
      }
    },
  });

  useCommand(ref, {
    shortcuts: ['shift + tab'],
    name: 'previousColumn',
    handle: ({ originalEvent, descendants, range }) => {
      const target = descendants.at(-1);
      const nearestTd = isElement(target)
        ? target.closest('td')
        : target?.parentElement?.closest('td');

      if (nearestTd?.previousSibling) {
        originalEvent.preventDefault();
        const node = getFirstDeepLeaf(nearestTd.previousSibling)
          ?? nearestTd.previousSibling;

        range.setStart(node, 0);
        range.setEnd(node, 0);

        return;
      }

      if (nearestTd?.parentElement?.previousSibling) {
        originalEvent.preventDefault();
        const previousTd = nearestTd?.parentElement?.previousSibling.lastChild;
        const node = getFirstDeepLeaf(previousTd) ?? previousTd!;
        range.setStart(node, 0);
        range.setEnd(node, 0);
      }
    },
  });

  const { markToRevert } = useMutation(ref, ({ removed, mutations }) => {
    markToRevert(mutations);

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
);
