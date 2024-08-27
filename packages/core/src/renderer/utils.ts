import * as A from 'fp-ts/lib/Array';
import { pipe } from 'fp-ts/lib/function';
import { type ReactElement } from 'react';

import { type PropsWithBrick } from '../components';
import { type Plugin } from '../plugins';

const getRender = ({ render }: Plugin) => render;

export const getRenderFromPlugins = (
  plugins: Record<string | symbol, Plugin> = {},
) => pipe(
  Object.values(plugins),
  A.concat(Object.getOwnPropertySymbols(plugins)
    .map((symbol) => plugins[symbol])),
  A.map(getRender),
  A.filter(Boolean),
);

export const renderWithPlugins = (
  plugins: Record<string | symbol, Plugin>,
  element: ReactElement<PropsWithBrick>,
) => pipe(
  getRenderFromPlugins(plugins),
  A.reduce(
    element,
    (acc, fn) => fn?.(acc) ?? acc,
  ),
);
