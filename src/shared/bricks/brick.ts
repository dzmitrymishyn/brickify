import { FC, ForwardRefExoticComponent } from 'react';

import { ChangeType } from './changes';
import { BrickValue } from './utils/values';

export type Component<Props = {}> = FC<Props> | ForwardRefExoticComponent<Props>;

export type NamedComponent = {
  displayName?: string;
  name: string;
};

export type PropsWithBrick<Value extends BrickValue = BrickValue> = {
  brick: { value: Value; path(): string[] };
};

export type ChangeOptions<Value> = {
  type: ChangeType;
  oldValue?: Value;
};

export type PropsWithChange<Value extends BrickValue = BrickValue> = {
  onChange?(value: Value | null, options: ChangeOptions<Value>): void;
};
