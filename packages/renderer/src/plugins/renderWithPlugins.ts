import { curry } from '@brickifyio/utils/functions';
import * as A from 'fp-ts/lib/Array';
import { pipe } from 'fp-ts/lib/function';
import { type ReactElement } from 'react';

import { getPlugins } from './getPlugins';
import { type Plugin, type PluginMap } from './plugins';

const getRender = ({ render }: Plugin) => render;

const getRenderFromPlugins = (
  plugins: PluginMap = {},
) => pipe(
  getPlugins(plugins),
  A.map(getRender),
  A.filter(Boolean),
);

export const renderWithPlugins = curry((
  plugins: PluginMap,
  element: ReactElement,
) => pipe(
  getRenderFromPlugins(plugins),
  A.reduce(element, (acc, fn) => fn?.(acc) ?? acc),
));
