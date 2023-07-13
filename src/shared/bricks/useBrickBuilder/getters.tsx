import { flow, pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';
import * as R from 'fp-ts/lib/Reader';
import { cloneElement } from 'react';

import { BrickCacheValue, Cache } from './cache';
import { generatedName } from './utils';
import { Brick, BrickValue } from '../utils';

type Deps = {
  Component: Brick;
  cached?: BrickCacheValue;
  cache: Cache<BrickCacheValue>;
  props: Record<string, unknown>;
  uid: string;
};

const getCachedCustomElement = (value: BrickValue<string | Symbol> & { children?: unknown }) =>
  pipe(
    R.ask<Pick<Deps, 'Component' | 'cached'>>(),
    R.map(({ Component, cached }) => (
      cached?.Component.brick === Component.brick
      && value.brick === generatedName
      && value.children === cached.value.children
      && ({ element: cached.element, dirty: false })
      || null
    )),
  );

const getCachedElement = pipe(
  R.ask<Pick<Deps, 'Component' | 'cached' | 'props'>>(),
  R.map(({ Component, cached, props }) => (
    cached?.Component.brick === Component.brick
    && ({ element: cloneElement(cached.element, props), dirty: true })
    || null
  )),
);

const createElement = pipe(
  R.ask<Pick<Deps, 'Component' | 'props' | 'uid'>>(),
  R.map(({ Component, props, uid }) => ({
    element: (
      <Component
        {...props}
        key={uid}
      />
    ),
    dirty: true,
  })),
);

export const getOrCreateElement = (value: BrickValue<string | Symbol> & { children?: unknown }) => pipe(
  R.ask<Deps>(),
  R.map((deps) => pipe(
    getCachedCustomElement(value)(deps),
    flow(O.fromNullable, O.getOrElse(() => getCachedElement(deps))),
    flow(O.fromNullable, O.getOrElse(() => createElement(deps))),
  )),
);
