import { type Change } from './change';
import { of } from './of';
import {
  makeChangesMap,
  patch,
} from './patch';

describe('makeChangesMap()', () => {
  it('should build changes map', () => {
    const update1: Change = { type: 'update', value: {}, path: ['children', '0', 'test1'] };
    const update2: Change = { type: 'update', value: {}, path: ['children', '1', 'test2'] };
    const update3: Change = { type: 'update', value: {}, path: ['children', '3', 'test3'] };

    const nextMap = makeChangesMap([update1, update2, update3]);

    expect(nextMap).toMatchObject({
      '': [],
      'children': [],
      'children/0': [],
      'children/0/test1': [update1],
      'children/1': [],
      'children/1/test2': [update2],
      'children/3': [],
      'children/3/test3': [update3],
    });
  });

  it('should build empty map on empty changes array', () => {
    expect(makeChangesMap([])).toMatchObject({});
  });
});

describe('patch()', () => {
  // const a =
  it('should add first element in the model', () => {
    const tree = of({}, ['children'], {
      children: [
        of({ test: 2 }),
      ],
    });

    const nextValue = patch(tree, [
      { type: 'add', path: ['children', '0'], value: { test: 1 } },
    ]);

    expect(nextValue).toMatchObject({
      children: [{ test: 1 }, { test: 2 }],
    });
  });

  it('should add last element in the model', () => {
    const tree = of({}, ['children'], {
      children: [
        of({ test: 1 }),
      ],
    });

    const nextValue = patch(tree, [
      { type: 'add', path: ['children', '1'], value: { test: 2 } },
    ]);

    expect(nextValue).toMatchObject({
      children: [{ test: 1 }, { test: 2 }],
    });
  });

  it('should add first/last/middle element in the model', () => {
    const tree = of({}, ['children'], {
      children: [
        of({ test: 2 }),
        of({ test: 4 }),
        of({ test: 6 }),
      ],
    });

    const nextValue = patch(tree, [
      { type: 'add', path: ['children', '0'], value: { test: 1 } },
      { type: 'add', path: ['children', '1'], value: { test: 3 } },
      { type: 'add', path: ['children', '2'], value: { test: 5 } },
      { type: 'add', path: ['children', '3'], value: { test: 7 } },
    ]);

    expect(nextValue).toMatchObject({
      children: Array.from({ length: 7 }, (_, index) => ({ test: index + 1 })),
    });
  });

  it('should remove element and leave empty array', () => {
    const tree = of({}, ['children'], {
      children: [
        of({ test: 1 }),
      ],
    });

    const nextValue = patch(tree, [
      { type: 'remove', path: ['children', '0']},
    ]);

    expect(nextValue).toMatchObject({
      children: [],
    });
  });

  it('should remove elements', () => {
    const tree = of({}, ['children'], {
      children: [
        of({ test: 1 }),
        of({ test: 2 }),
        of({ test: 3 }),
      ],
    });

    const nextValue = patch(tree, [
      { type: 'remove', path: ['children', '1']},
    ]);

    expect(nextValue).toMatchObject({
      children: [{ test: 1 }, { test: 3 }],
    });
  });

  it('should not mutate the input tree', () => {
    const tree = of({}, ['children'], {
      children: [
        of({ test: 1 }),
      ],
    });
    const treeClone = of({}, ['children'], {
      children: [
        of({ test: 1 }),
      ],
    });

    const nextValue = patch(tree, [
      { type: 'remove', path: ['children', '0'] },
    ]);

    expect(nextValue).toMatchObject({ children: [] });
    expect(tree).toMatchObject(treeClone);
  });

  it('should update the value', () => {
    const tree = of({}, ['children'], {
      children: [
        of({ test: 1 }),
      ],
    });

    const updatedValue = { test: 2, newField: true };
    const nextValue = patch(tree, [
      { type: 'update', path: ['children', '0'], value: updatedValue },
    ]);

    expect(nextValue).toMatchObject({ children: [{ test: 2, newField: true }] });
  });

  it('should add, update and remove nothing', () => {
    const tree = of({}, ['children'], {
      children: [
        of({ test: 1 }),
      ],
    });

    const nextValue = patch(tree, [
      { type: 'update', path: ['children', '3'], value: {} },
      { type: 'update', path: ['children', '-1'], value: {} },
      { type: 'remove', path: ['children', '3'] },
      { type: 'remove', path: ['children', '-1'] },
      { type: 'remove', path: ['children', '100'] },
      { type: 'add', path: ['children', '100'], value: {} },
      { type: 'add', path: ['children', '3'], value: {} },
      { type: 'add', path: ['children', '-1'], value: {} },
    ]);

    expect(nextValue).toMatchObject({ children: [{ test: 1 }] });
  });

  it('should emit an assertion when we try to remove a root', () => {
    const tree = of({}, ['children'], {
      children: [
        of({ test: 1 }),
      ],
    });

    expect(() => patch(tree, [
      { type: 'remove', path: [''] },
    ])).toThrow('Unpredictable removal of root element');
  });

  it('should deeply update a model', () => {
    const tree = of({}, ['children'], {
      children: [
        of({ level: 1 }, ['children'], {
          children: [of({ level: 2, data: 'hello' }, ['children'], {
            children: [of({ level: 3, data: 'world' })],
          })],
        }),
      ],
    });

    const nextValue = patch(tree, [
      {
        type: 'update',
        path: ['children', '0', 'children', '0'],
        value: { level: 2, data: '!!!HELLO!!!' },
      },
      {
        type: 'update',
        path: ['children', '0', 'children', '0', 'children', '0'],
        value: { level: 3, data: '!!!WORLD!!!' },
      },
    ]);

    expect(nextValue).toMatchObject({
      children: [{
        level: 1,
        children: [{
          level: 2,
          data: '!!!HELLO!!!',
          children: [{
            level: 3,
            data: '!!!WORLD!!!',
          }],
        }],
      }],
    });
  });

  it('should deeply make multiple updates', () => {
    const tree = of({}, ['children'], {
      children: [
        of({ level: 1 }, ['children'], {
          children: [of({ level: 2, data: 'hello' }, ['children'], {
            children: [of({ level: 3, data: 'world' })],
          })],
        }),
      ],
    });

    const nextValue = patch(tree, [
      {
        type: 'update',
        path: ['children', '0', 'children', '0'],
        value: { level: 2, data: '!!!HELLO!!!' },
      },
      {
        type: 'remove',
        path: ['children', '0', 'children', '0', 'children', '0'],
      },
      {
        type: 'add',
        path: ['children', '0'],
        value: { test: 'first element' },
      },
      {
        type: 'add',
        path: ['children', '0', 'children', '0', 'children', '0'],
        value: { data: 'NEW WORLD' },
      },
      {
        type: 'add',
        path: ['children', '1'],
        value: { test: 'last element' },
      },
    ]);

    expect(nextValue).toMatchObject({
      children: [
        {
          test: 'first element',
        },
        {
          level: 1,
          children: [{
            level: 2,
            data: '!!!HELLO!!!',
            children: [{
              data: 'NEW WORLD',
            }],
          }],
        },
        {
          test: 'last element',
        },
      ],
    });
  });

  it('should ignore addition without any index', () => {
    const tree = of({}, ['children'], {
      children: [
        of({ test: 2 }),
      ],
    });

    const nextValue = patch(tree, [
      {
        type: 'add',
        path: ['children'],
        value: { test: 'first element' },
      },
    ]);

    expect(nextValue).toMatchObject({
      children: [{ test: 2 },],
    });
  });

  it('should throw assertion error for unknown change type', () => {
    const tree = of({}, ['children'], {
      children: [of({})],
    });

    expect(() => patch(tree, [
      {
        type: 'unknown' as Change['type'],
        path: ['children', '0'],
        value: { test: 'test' },
      },
    ])).toThrow('Unknown mutation type');
  });
});
