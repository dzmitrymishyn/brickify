import * as A from 'fp-ts/lib/Array';
import { pipe } from 'fp-ts/lib/function';
import { type ReactElement } from 'react';

import { getPlugins, type Plugin } from '../plugins';

const getRender = ({ render }: Plugin) => render;

export const getRenderFromPlugins = (
  plugins: Record<string | symbol, Plugin> = {},
) => pipe(
  getPlugins(plugins),
  A.map(getRender),
  A.filter(Boolean),
);

export const renderWithPlugins = (
  plugins: Record<string | symbol, Plugin>,
  element: ReactElement,
) => pipe(
  getRenderFromPlugins(plugins),
  A.reduce(
    element,
    (acc, fn) => fn?.(acc) ?? acc,
  ),
);
