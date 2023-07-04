'use client';

import { addCustomChildren, component, factory, make } from '@/shared/bricks';

type Props = {
  children: string | number;
};

function of<Name extends string>(name: Name) {
  return make(
    component(
      name,
      ({ children }: Props) => {
        return children;
      },
    ),
    factory(of),
  );
}

export default addCustomChildren(
  of('text'),
  (value: string) => typeof value === 'string',
);
