import { BrickName } from '../utils';

export type BrickFactory<Input, Output extends BrickName> = {
  of(...props: Input[]): Output;
};

export const addFactory = <P extends (...props: any[]) => any>(of: P) => ({ of });
