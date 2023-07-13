import { ReactElement } from 'react';

export type BuildResults = {
  dirty: boolean;
  elements?: ReactElement[] | null;
};

export const generatedName = Symbol('generated');
export const makeGeneratedBrick = (value: unknown) => ({
  brick: generatedName,
  children: value,
});
