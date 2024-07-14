import {
  type FC,
  type ForwardRefExoticComponent,
  type MutableRefObject,
} from 'react';

import { type BrickValue } from './utils/values';

export type Component<Props = object> =
  | FC<Props>
  | ForwardRefExoticComponent<Props>;

export type NamedComponent = {
  displayName?: string;
  name: string;
  brick?: string;
};

export type PropsWithBrick<Value extends BrickValue = BrickValue> = {
  brick: { value: Value; pathRef: MutableRefObject<() => string[]> };
};
