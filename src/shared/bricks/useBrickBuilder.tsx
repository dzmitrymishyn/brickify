import * as A from 'fp-ts/lib/Array';
import { flow, pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';
import { ReactNode, useMemo } from 'react';

import { array } from '@/shared/operators';

import { Brick, BrickValue, isBrick, isBrickValue, isChildrenFitBrick } from './utils';

type ChildValue = BrickValue & {
  key: number;
  children?: unknown;
};

// eslint-disable-next-line react/display-name
const buildChildren = ({ brick, key, ...props }: ChildValue) => (Component: Brick) => {
  const children = props.children ? {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    children: build(
      props.children,
      'allowedBricks' in Component ? Component.allowedBricks as Brick[] : [],
    ),
  } : {};

  return !Component ? null : (
    <Component
      {...props}
      {...children}
      key={key}
    />
  );
};

function build(
  inputValue: unknown,
  bricks: Brick[],
): ReactNode {
  return pipe(
    array(inputValue),
    A.mapWithIndex((key, value) => {
      if (isBrickValue(value)) {
        return pipe(
          bricks,
          A.findFirst(flow(
            O.fromPredicate(isBrick),
            O.map(({ brick }) => brick === value.brick),
            O.getOrElse(() => false),
          )),
          O.map(buildChildren({ ...value, key })),
          O.getOrElseW(() => null),
        );
      }

      return pipe(
        bricks,
        A.findFirst(isChildrenFitBrick(value)),
        O.map(buildChildren({ brick: 'generated', key, children: value })),
        O.getOrElseW(() => value as ReactNode),
      );
    }),
  );
}

export const useBricksBuilder = (
  value: unknown,
  bricks: Brick[],
): ReactNode => useMemo(() => build(value, bricks), [value, bricks]);
