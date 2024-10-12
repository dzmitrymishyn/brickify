import {
  type FC,
  type ForwardRefExoticComponent,
} from 'react';

import { type BrickValue } from './values';
import { type BrickStoreValue } from '../store';

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

export type PropsWithBrick<Value extends object = BrickValue> = {
  brick: BrickStoreValue<Value>;
};
