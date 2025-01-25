import { patch } from './patch';

describe('primitives', () => {
  it('should return primitive on update', () => {
    const [result] = patch(
      'test',
      [{ type: 'update', value: 'expected', path: [] }],
    );

    expect(result).toBe('expected');
  });

  it('should not do anything for add type', () => {
    const [result] = patch(
      'expected',
      [{ type: 'add', value: 'unexpected', path: [] }],
    );

    expect(result).toBe('expected');
  });

  it('should return null for remove event', () => {
    const [result] = patch(
      'unexpected',
      [{ type: 'remove', value: '', path: [] }],
    );

    expect(result).toBe(null);
  });

  it('should return null for first remove change', () => {
    const [result] = patch(
      'unexpected',
      [
        { type: 'remove', value: '', path: [] },
        { type: 'update', value: 'unexpected2', path: [] },
      ],
    );

    expect(result).toBe(null);
  });

  it('should return null for last remove change', () => {
    const [result] = patch(
      'unexpected',
      [
        { type: 'update', value: 'unexpected2', path: [] },
        { type: 'remove', value: '', path: [] },
      ],
    );

    expect(result).toBe(null);
  });

  it('should change type to another type', () => {
    const [result] = patch(
      'unexpected',
      [{ type: 'update', value: 123, path: [] }],
    );

    expect(result).toBe(123);
  });

  it('should do nothing for unknown path', () => {
    const [result] = patch(
      'expected',
      [{ type: 'update', value: 'unexpected', path: ['test', 'path', '1'] }],
    );

    expect(result).toBe('expected');
  });
});

describe('objects', () => {
  it('should do nothing for unknown path', () => {
    const expected = { test: 1 };
    const [result] = patch(
      expected,
      [{ type: 'update', value: 'unexpected', path: ['test', 'unknown'] }],
    );

    expect(result).toBe(expected);
  });

  it('should not update unknown field in object', () => {
    const expected = { test: 1 };
    const [result] = patch(
      expected,
      [{ type: 'update', value: 'unexpected', path: ['unknown'] }],
    );

    expect(result).toBe(expected);
  });

  it('should update known path', () => {
    const [result] = patch(
      { test: 1 },
      [{ type: 'update', value: 'expected', path: ['test'] }],
    );

    expect(result).toEqual({ test: 'expected' });
  });

  it('should update deep object', () => {
    const [result] = patch(
      { firstLayer: { secondLayer: 2 } },
      [{
        type: 'update',
        value: 'expected',
        path: ['firstLayer', 'secondLayer'],
      }],
    );

    expect(result).toEqual({
      firstLayer: {
        secondLayer: 'expected',
      },
    });
  });

  it('should update deep object with multiple changes', () => {
    const [result] = patch(
      {
        firstLayer: {
          secondLayer: { title: 'title', description: 'description' },
        },
      },
      [{
        type: 'update',
        value: 'updated title',
        path: ['firstLayer', 'secondLayer', 'title'],
      }, {
        type: 'update',
        value: 'updated description',
        path: ['firstLayer', 'secondLayer', 'description'],
      }],
    );

    expect(result).toEqual({
      firstLayer: {
        secondLayer: {
          title: 'updated title',
          description: 'updated description',
        },
      },
    });
  });

  it('should set null for removed path', () => {
    const [result] = patch(
      {
        firstLayer: {
          secondLayer: { test: 1 },
        },
      },
      [{
        type: 'remove',
        value: 'updated title',
        path: ['firstLayer', 'secondLayer'],
      }],
    );

    expect(result).toEqual({
      firstLayer: {
        secondLayer: null,
      },
    });
  });

  it('should set null for removed top level', () => {
    const [result] = patch(
      {
        firstLayer: {
          secondLayer: { test: 1 },
        },
      },
      [{ type: 'remove', path: [] }],
    );

    expect(result).toBe(null);
  });
});

describe('arrays', () => {
  it('should add element before first item', () => {
    const [result] = patch(
      [1],
      [{ type: 'add', path: ['0'], value: 0 }],
    );

    expect(result).toEqual([0, 1]);
  });

  it('should add element after last item', () => {
    const [result] = patch(
      [1],
      [{ type: 'add', path: ['1'], value: 2 }],
    );

    expect(result).toEqual([1, 2]);
  });

  it('should add element between items', () => {
    const [result] = patch(
      [1, 3],
      [{ type: 'add', path: ['1'], value: 2 }],
    );

    expect(result).toEqual([1, 2, 3]);
  });

  it('should remove multiple items', () => {
    const [result] = patch(
      [1, 3],
      [{ type: 'remove', path: ['0'] }, { type: 'remove', path: ['1'] }],
    );

    expect(result).toEqual([]);
  });

  it('should remove single item', () => {
    const [result] = patch(
      [1, 2, 3],
      [{ type: 'remove', path: ['1'] }],
    );

    expect(result).toEqual([1, 3]);
  });

  it('should remove first item', () => {
    const [result] = patch(
      [1, 2, 3],
      [{ type: 'remove', path: ['0'] }],
    );

    expect(result).toEqual([2, 3]);
  });

  it('should remove last item', () => {
    const [result] = patch(
      [1, 2, 3],
      [{ type: 'remove', path: ['2'] }],
    );

    expect(result).toEqual([1, 2]);
  });

  it('should perform multiple actions', () => {
    const [result] = patch(
      [1, 2, 3, 100],
      [
        { type: 'remove', path: ['3'] },
        { type: 'update', path: ['1'], value: 0 },
        { type: 'add', path: ['2'], value: 4 },
        { type: 'add', path: ['2'], value: 5 },
        { type: 'update', path: ['0'], value: -1 },
        { type: 'remove', path: ['2'] },
      ],
    );

    expect(result).toEqual([-1, 0, 4, 5]);
  });
});

describe('arrays & objects', () => {
  it('should mutate a property inside an object', () => {
    const [result] = patch(
      { value: [{ test: 'initial' }] },
      [
        { type: 'update', path: ['value', '0', 'test'], value: 'expected' },
      ],
    );

    expect(result).toEqual({ value: [{ test: 'expected' }] });
  });

  it('should add to object new keys', () => {
    const [result] = patch(
      { value: [{ test: 'initial' }] },
      [
        { type: 'update', path: ['value', '0'], value: { key1: 1, key2: 2 } },
      ],
    );

    expect(result).toEqual({ value: [{ test: 'initial', key1: 1, key2: 2 }] });
  });

  it('should leave empty array when last element is removed', () => {
    const [result] = patch(
      { value: [{ test: 'initial' }] },
      [{ type: 'remove', path: ['value', '0'] }],
    );

    expect(result).toEqual({ value: [] });
  });

  it('should make deep mutation for an object', () => {
    const [result] = patch(
      { value: [{ test: 'initial', subObject: [{ subTest: 1 }] }] },
      [
        { type: 'update', path: ['value', '0', 'test'], value: 'expected' },
        {
          type: 'update',
          path: ['value', '0', 'subObject', '0', 'subTest'],
          value: 2,
        },
        {
          type: 'add',
          path: ['value', '0', 'subObject', '0'],
          value: 'expected before',
        },
        {
          type: 'add',
          path: ['value', '0', 'subObject', '1'],
          value: 'expected after',
        },
      ],
    );

    expect(result).toEqual({
      value: [{
        test: 'expected',
        subObject: ['expected before', { subTest: 2 }, 'expected after'],
      }],
    });
  });
});
