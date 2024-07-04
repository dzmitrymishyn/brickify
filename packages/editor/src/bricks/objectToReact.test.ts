import { type Node, of } from '@brickifyio/utils/slots-tree';
import * as O from 'fp-ts/lib/Option';
import { createElement, type MutableRefObject } from 'react';

import { type Component } from './brick';
import {
  addCached,
  addChange,
  addPathRef,
  type CacheItem,
  safeComponent,
  safeValue,
} from './objectToReact';
import { type BrickValue } from './utils';

const testBrick: BrickValue = {
  brick: 'test',
};

const createPathRef = (
  path: string[] = [],
): MutableRefObject<() => string[]> => ({ current: jest.fn(() => path) });

const createDeps = ({
  onChange = jest.fn(() => null),
  cache = new WeakMap(),
  slots = {},
  parentPathRef = createPathRef(['children', '0']),
  parent = of({}, ['children']),
}: Partial<{
  onChange: () => void;
  cache: WeakMap<BrickValue, CacheItem>;
  slots: Record<string, Component>;
  parentPathRef: MutableRefObject<() => string[]>;
  parent: Node;
}> = {}) => ({
  onChange,
  cache,
  slots,
  parentPathRef,
  parent,
});

const createCacheItem = ({
  path = [],
}: {
  path?: string[];
} = {}) => ({
  pathRef: { current: () => path },
  node: of(testBrick),
  element: createElement('div'),
});

const createCache = (entries: [BrickValue, CacheItem][] = []) =>
  new WeakMap(entries);

describe('safeValue', () => {
  it('should return none for non-BrickValue values', () => {
    expect(safeValue({ value: Symbol('test'), index: 0 })).toEqual(O.none);
    expect(safeValue({ value: { test: 123 }, index: 0 })).toEqual(O.none);
    expect(safeValue({ value: [Infinity], index: 0 })).toEqual(O.none);
    expect(safeValue({ value: undefined, index: 0 })).toEqual(O.none);
    expect(safeValue({ value: 'string', index: 0 })).toEqual(O.none);
    expect(safeValue({ value: null, index: 0 })).toEqual(O.none);
    expect(safeValue({ value: NaN, index: 0 })).toEqual(O.none);
    expect(safeValue({ value: 1, index: 0 })).toEqual(O.none);
  });

  it('should return O.some for BrickValue', () => {
    expect(safeValue({ value: testBrick, index: 0 })).toEqual(O.some({
      value: testBrick,
      index: 0,
    }));
  });
});

describe('safeComponent', () => {
  it('should return none if we do not have Component', () => {
    const deps = createDeps();
    const results = safeComponent(deps)(O.some({ value: testBrick }));

    expect(results).toEqual(O.none);
  });

  it('should return Component for a brick', () => {
    const Component = () => null;
    const deps = createDeps({
      slots: {
        [testBrick.brick]: Component,
      },
    });
    const results = safeComponent(deps)(O.some({ value: testBrick }));

    expect(results).toEqual(O.some({
      value: testBrick,
      Component,
    }));
  });
});

describe('addCached', () => {
  it('should add undefined as a cached item', () => {
    const deps = createDeps();
    const inputObject = { value: testBrick };
    const results = addCached(deps)(inputObject);

    expect(results).toEqual({ ...inputObject, cached: undefined });
  });

  it('should add cached item to an object', () => {
    const cacheItem = createCacheItem();
    const cache = createCache([
      [testBrick, cacheItem],
    ]);
    const deps = createDeps({ cache });
    const inputObject = { value: testBrick };
    const results = addCached(deps)(inputObject);

    expect(results).toMatchObject({ ...inputObject, cached: cacheItem });
  });

  it('should return undefined with modified value', () => {
    const deps = createDeps({
      cache: createCache([
        [testBrick, createCacheItem()],
      ]),
    });
    const inputObject = {
      value: { ...testBrick, brick: 'newBrick' },
    };
    const results = addCached(deps)(inputObject);

    expect(results).toEqual({
      ...inputObject,
      cached: undefined,
    });
  });
});

describe('addPathRef', () => {
  it('should create a new function for the pathRef', () => {
    const deps = createDeps({
      parentPathRef: createPathRef(['children']),
    });

    const results = addPathRef(deps)({ cached: undefined, index: 1 });

    expect(results?.pathRef?.current).toBeTruthy();
    expect(results.pathRef.current()).toEqual(['children', '1']);
  });

  it('should update pathRef in cachedItem', () => {
    const cached = createCacheItem({ path: ['children', '10'] });
    const deps = createDeps({
      parentPathRef: createPathRef(['children']),
    });

    expect(cached.pathRef.current()).toEqual(['children', '10']);

    const results = addPathRef(deps)({ cached, index: 1 });

    expect(results.pathRef).toBe(cached.pathRef);
    expect(results.pathRef.current()).toEqual(['children', '1']);
  });
});

describe('addChange', () => {
  it('should generate change function and call onChange and pathRef', () => {
    const deps = createDeps();
    const data = {
      value: testBrick,
      pathRef: createPathRef(['children', '10']),
    };

    const { change } = addChange(deps)(data);

    expect(() => change({ type: 'add' })).not.toThrow();

    expect(data.pathRef.current).toHaveBeenCalled();
    expect(deps.onChange).toHaveBeenCalledWith({
      type: 'add',
      value: testBrick,
      path: ['children', '10'],
    });
  });
});
