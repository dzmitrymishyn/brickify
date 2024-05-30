import { type FC, forwardRef } from 'react';

import { type Component } from '../brick';

/* eslint @typescript-eslint/no-explicit-any: off -- it's ok */
export const extend = <C extends Component<any>, Parts extends object[]>(
  brick: C,
  ...parts: Parts
): C & Parts[number] => {
  // eslint-disable-next-line -- TODO: Check it
  const config = Object.assign(
    { displayName: brick.displayName ?? brick.name },
    ...parts,
  );

  const newBrick = typeof brick === 'function'
    ? brick.bind(null)
    // If it's a forwardRef we need to handle render function that isn't described in the types
    // eslint-disable-next-line -- it's ok that this component doesn't have displayName
    : forwardRef((props, ref) => (brick as { render: FC<unknown> }).render(props, ref));

  // We need to exclude render fn from the old ForwardedRef component
  const { render: _, ...oldBrick } = brick as unknown as { render: FC<unknown> };

  // eslint-disable-next-line -- TODO: Check it
  return Object.assign(newBrick, oldBrick, config);
};
