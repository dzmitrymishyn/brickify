import {
  type FC,
  type ForwardRefExoticComponent,
} from 'react';

import { type BrickValue } from './values';
import { type BrickStoreValue } from '../store';

// We should allow to define any property we want. Any is the easiest way for
// doing that.
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ok
export type Component<Props extends object = any> =
  ForwardRefExoticComponent<Props> | FC<Props>;

export type NamedComponent = {
  displayName?: string;
  name: string;
  brick?: string;
};

export type PropsWithBrick<Value extends object = BrickValue> = {
  brick: Pick<BrickStoreValue<Value>, 'pathRef' | 'value'>;
};
