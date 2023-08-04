import { formatBricksArray } from './fns';

const createBrick = (name: string) => Object.assign(() => null, {
  brick: name,
  is: () => true,
  parseValue: () => ({ brick: 'test' }),
});

it('should format bricks array to key-value object', () => {
  const brick1 = createBrick('test1');
  const brick2 = createBrick('test2');

  expect(formatBricksArray([brick1, brick2])).toMatchObject({
    test1: brick1,
    test2: brick2,
  });
});

it('should format empty props to empty object', () => {
  expect(formatBricksArray()).toMatchObject({});
  expect(formatBricksArray([])).toMatchObject({});
});
