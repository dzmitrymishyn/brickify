import { type FC, type ForwardRefExoticComponent } from 'react';

import { type ChangeType } from './changes';
import { type BrickValue } from './utils/values';

export type Component<Props = object> = FC<Props> | ForwardRefExoticComponent<Props>;

export type NamedComponent = {
  displayName?: string;
  name: string;
}

export type PropsWithBrick<Value extends BrickValue = BrickValue> = {
  brick: { value: Value; path: () => string[] };
}

export type ChangeOptions<Value> = {
  type: ChangeType;
  oldValue?: Value;
}

export type PropsWithChange<Value extends BrickValue = BrickValue> = {
  onChange?: (value: Value | null, options: ChangeOptions<Value>) => void;
}
