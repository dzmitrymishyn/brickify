import {
  type FC,
  type ForwardRefExoticComponent,
} from 'react';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any --
 * We should allow to define any property we want. Any is the easiest way for
 * doing that.
 */
export type Component<Props extends object = any> =
  ForwardRefExoticComponent<Props> | FC<Props>;

export type NamedComponent = {
  displayName?: string;
  name: string;
  brick?: string;
};

export type PropsWithBrick = {
  brick?: string;
};
