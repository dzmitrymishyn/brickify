import {
  extend,
  next,
  previous,
  type PropsWithBrick,
  type PropsWithChange,
  useBrickChildrenRegistry,
  useBrickRegistry,
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
          onChange(new Array(target.childNodes.length).fill(''), {
            type: 'add',
            path: nextRowPath,
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
        onChange(null, {
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

        onChange(null, {
          type: 'add',
          path: [''],
        });
      },
    },
  ]),
);

const TableRow = extend(
  ({ brick, children, onChange }: TableRowProps) => {
    const { ref: brickRef } = useBrickRegistry(brick);
    const childrenBricks = useBrickChildrenRegistry(
      brick,
      null,
      children,
      (childBrick, index) => (
        <TableCell
          component="div"
          brick={childBrick}
          key={index}
          value={childBrick.value}
          style={{ border: '1px solid #ccc', padding: 10 }}
          onChange={({ value }, change) => onChange?.(value, change)}
        />
      ),
    );

    const ref = useMergedRefs(
      brickRef,
      useCommands([TableCell]),
      useMutation(({ remove }) => {
        if (remove) {
          onChange?.({ type: 'remove' }, brick);
        }
      })
    );

    return (
      <div ref={ref} style={{ display: 'contents' }}>
        {childrenBricks}
      </div>
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
  const { ref: brickRef } = useBrickRegistry(brick);
  const childrenBricks = useBrickChildrenRegistry(
    brick,
    'children',
    children,
    (row, index) => (
      <TableRow
        key={index}
        brick={row}
        onChange={onChange}
      >
        {row}
      </TableRow>
    ),
  );

  const ref = useMergedRefs(
    brickRef,
    useCommands([TableRow]),
    useMutation((mutation) => {
      if (mutation.remove) {
        return onChange?.(null, { type: 'remove', brick });
      }
    }),
  );

  return (
    <div
      ref={ref}
      data-brick="table"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${children?.[0]?.length}, 1fr)`,
      }}
    >
      {childrenBricks}
    </div>
  );
};

export default extend(
  Table,
  withName('Table'),
);
