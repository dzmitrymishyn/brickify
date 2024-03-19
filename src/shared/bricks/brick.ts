import { FC, ForwardRefExoticComponent } from 'react';

type Component<Props = {}> = FC<Props> | ForwardRefExoticComponent<Props>;

export type Brick<Props extends { brickValue: any } = { brickValue: {} }> = Component<Props>;
