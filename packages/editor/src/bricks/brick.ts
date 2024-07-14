import {
  type FC,
  type ForwardRefExoticComponent,
  type MutableRefObject,
} from 'react';

import { type BrickValue } from './utils/values';
import { type Add, type Remove, type Update } from '../core/changes';

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

export type ChangeProps<Value extends BrickValue> =
  | { type: Remove['type'] }
  | ({ type: Add['type'] } & Partial<Value>)
  | ({ type: Update['type'] } & Partial<Value>);

export type PropsWithChange<Value extends BrickValue = BrickValue> = {
  onChange?: (...changes: ChangeProps<Value>[]) => (
    ChangeProps<Value>
    | ChangeProps<Value>[]
    | void
    | null
  );
};
