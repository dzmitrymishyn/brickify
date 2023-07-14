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
  cache: Cache;
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
      && cached.element
      || null
    )),
  );

const getCachedElement = pipe(
  R.ask<Pick<Deps, 'Component' | 'cached' | 'props'>>(),
  R.map(({ Component, cached, props }) => (
    cached?.Component.brick === Component.brick
    && cloneElement(cached.element, props)
    || null
  )),
);

const createElement = pipe(
  R.ask<Pick<Deps, 'Component' | 'props' | 'uid'>>(),
  R.map(({ Component, props, uid }) => (
    <Component
      {...props}
      key={uid}
    />
  )),
);

export const fromCacheOrCreate = (value: BrickValue<string | Symbol> & { children?: unknown }) => pipe(
  R.ask<Deps>(),
  R.map((deps) => pipe(
    getCachedCustomElement(value)(deps),
    flow(O.fromNullable, O.getOrElse(() => getCachedElement(deps))),
    flow(O.fromNullable, O.getOrElse(() => createElement(deps))),
  )),
);
