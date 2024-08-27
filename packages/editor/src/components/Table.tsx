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
  withShortcuts([
    {
      name: 'nextCellOrNewRow',
      shortcuts: ['tab'],
      handle: ({
        originalEvent,
        target,
        descendants,
        resultRange,
        getFromStore,
        onChange,
      }) => {
        originalEvent.preventDefault();

        const currentCell = descendants.at(-1)!;

        if (currentCell?.nextSibling) {
          const currentCellStoredValue = getFromStore(currentCell)!;
          const nextCellPath = next(currentCellStoredValue.pathRef.current());

          resultRange({
            start: {
              offset: 0,
              path: nextCellPath,
            },
            end: {
              offset: 0,
              path: nextCellPath,
            },
          });
        } else if (target.nextSibling) {
          const currentRowStoredValue = getFromStore(target)!;
          const nextRowPath = next(currentRowStoredValue.pathRef.current());
          resultRange({
            start: {
              offset: 0,
              path: nextRowPath,
            },
            end: {
              offset: 0,
              path: nextRowPath,
            },
          });
        } else {
          const currentRowStoredValue = getFromStore(target)!;
          const nextRowPath = next(currentRowStoredValue.pathRef.current());
          onChange({
            type: 'add',
            path: nextRowPath,
            value: new Array(target.childNodes.length).fill(''),
          });
          resultRange({
            start: {
              offset: 0,
              path: [...nextRowPath, '0'],
            },
            end: {
              offset: 0,
              path: [...nextRowPath, '0'],
            },
          });
        }

        // Empty change
        onChange({
          type: 'add',
          path: [''],
        });
      },
    },
    {
      name: 'nextCellOrNewRow',
      shortcuts: ['shift+tab'],
      handle: ({
        originalEvent,
        target,
        descendants,
        resultRange,
        getFromStore,
        onChange,
      }) => {
        originalEvent.preventDefault();

        const currentCell = descendants.at(-1)!;

        if (currentCell?.previousSibling) {
          const currentCellStoredValue = getFromStore(currentCell)!;
          const nextCellPath = previous(
            currentCellStoredValue.pathRef.current(),
          );

          resultRange({
            start: {
              offset: 0,
              path: nextCellPath,
            },
            end: {
              offset: 0,
              path: nextCellPath,
            },
          });
        } else if (target.previousSibling) {
          const currentRowStoredValue = getFromStore(target)!;
          const nextRowPath = [...previous(
            currentRowStoredValue.pathRef.current(),
          ), `${target.childNodes.length - 1}`];
          resultRange({
            start: {
              offset: 0,
              path: nextRowPath,
            },
            end: {
              offset: 0,
              path: nextRowPath,
            },
          });
        }

        onChange({
          type: 'add',
          path: [''],
        });
      },
    },
  ]),
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
    <table ref={ref} data-brick="table">
      <tbody>
        {childrenBricks}
      </tbody>
    </table>
  );
};

export default extend(
  Table,
  withName('Table'),
);
