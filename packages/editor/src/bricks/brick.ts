import { type FC, type ForwardRefExoticComponent } from 'react';

import { type Add, type Remove, type Update } from './changes';
import { type BrickValue } from './utils/values';

export type Component<Props = object> = FC<Props> | ForwardRefExoticComponent<Props>;

export type NamedComponent = {
  displayName?: string;
  name: string;
};

export type PropsWithBrick<Value extends BrickValue = BrickValue> = {
  brick: { value: Value; path: () => string[] };
};

type ChangeProps<Value extends BrickValue> =
  | { type: Remove['type'] }
  | ({ type: Add['type'] } & Partial<Value>)
  | ({ type: Update['type'] } & Partial<Value>);

export type PropsWithChange<Value extends BrickValue = BrickValue> = {
  onChange?: (change: ChangeProps<Value>) => void;
};
