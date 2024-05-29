import { loopUntil } from './loopUntil';

type Item = {
  item: number;
  next: Item | null;
};

it('should go to the latest element', () => {
  const list: Item = {
    item: 1,
    next: {
      item: 2,
      next: {
        item: 3,
        next: null,
      },
    },
  };
  const mockedFn = jest.fn(() => null);

  const result = loopUntil(mockedFn, (current: Item) => current.next)(list);

  expect(result).toBeNull();
  expect(mockedFn).toHaveBeenLastCalledWith({ item: 3, next: null }, 2);
  expect(mockedFn).toHaveBeenCalledTimes(3);
});

it('should return the matched result', () => {
  const list: Item = {
    item: 1,
    next: {
      item: 2,
      next: {
        item: 3,
        next: null,
      },
    },
  };
  const mockedFn = jest.fn(({ item }: Item) => item === 2);

  const result = loopUntil(mockedFn, (current: Item) => current.next)(list);

  expect(result).toMatchObject({
    item: 2,
    next: { item: 3, next: null },
  });
  expect(mockedFn).lastCalledWith({ item: 2, next: { item: 3, next: null } }, 1);
  expect(mockedFn).toBeCalledTimes(2);
});

it('should pass correct index on each tick', () => {
  const list: Item = {
    item: 1,
    next: {
      item: 2,
      next: {
        item: 3,
        next: {
          item: 4,
          next: {
            item: 5,
            next: null,
          },
        },
      },
    },
  };
  const mockedFn = jest.fn<null, [number]>(() => null);

  loopUntil((_, index) => mockedFn(index), (current: Item) => current.next)(list);

  new Array(4).fill(null).forEach((_, index) => {
    expect(mockedFn).nthCalledWith(index + 1, index);
  });
});

it('should not call callback function', () => {
  const mockedFn = jest.fn();

  loopUntil(mockedFn, (current: Item) => current.next)(null);
  loopUntil(mockedFn, (current: Item) => current.next)(undefined);

  expect(mockedFn).not.toBeCalled();
});
