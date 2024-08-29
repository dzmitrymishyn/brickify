import {
  extend,
  next,
  previous,
  type PropsWithBrick,
  type PropsWithChange,
  useBrickRegistry,
  useChildrenRenderer,
  useCommands,
  useMergedRefs,
  useMutation,
  withName,
  withShortcuts,
} from '@brickifyio/core';
import { type FC } from 'react';

import Paragraph from '../Paragraph';

type TableRowProps = PropsWithBrick<object> & PropsWithChange & {
  children: string[];
};

const TableCell = extend(
  Paragraph,
  withName('TableCell'),
  withShortcuts([]),
);

const TableRow = extend(
  ({ brick, children, onChange }: TableRowProps) => {
    const ref = useMergedRefs(
      useBrickRegistry(brick),
      useCommands([TableCell]),
      useMutation(({ remove }) => {
        if (remove) {
          onChange?.({ type: 'remove', path: brick.pathRef.current() });
        }
      })
    );

    const childrenBricks = useChildrenRenderer(
      brick,
      null,
      children,
      (childBrick, index) => (
        <TableCell
          component="td"
          brick={childBrick}
          key={index}
          value={childBrick.value.value}
          style={{ border: '1px solid #ccc', padding: 10 }}
          onChange={(change) => onChange?.({
            ...change,
            value: change.value?.value,
          })}
        />
      ),
    );

    return (
      <tr ref={ref} data-brick="tableRow">
        {childrenBricks}
      </tr>
    );
  },
  withName('TableRow'),
  withShortcuts([
    {
      name: 'preventNewLine',
      shortcuts: ['enter'],
      handle: ({ stopBrickPropagation }) => {
        stopBrickPropagation();
      },
    },
  ]),
);

type Props = PropsWithBrick & PropsWithChange & {
  children: string[][];
};

const Table: FC<Props> = ({ children, brick, onChange }) => {
  const ref = useMergedRefs(
    useBrickRegistry(brick),
    useCommands([TableRow]),
    useMutation((mutation) => {
      if (mutation.remove) {
        return onChange?.({ type: 'remove', path: brick.pathRef.current() });
      }
    }),
  );

  const childrenBricks = useChildrenRenderer(
    brick,
    'children',
    children,
    (row, index) => (
      <TableRow
        key={index}
        brick={row}
        onChange={onChange}
      >
        {row.value}
      </TableRow>
    ),
  );

  return (
    <div contentEditable={false}>
      <table ref={ref} data-brick="table">
        <tbody>
          {childrenBricks}
        </tbody>
      </table>
    </div>
  );
};

export default extend(
  Table,
  withName('Table'),
);
