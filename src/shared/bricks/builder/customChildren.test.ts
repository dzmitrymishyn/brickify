import { addCustomChildren, hasCustomChildren } from './customChildren';

const createBrick = (additionalProps: object = {}) => {
  const brick = () => null;
  brick.brick = 'test';
  brick.is = () => true;
  brick.parseValue = () => null;
  return Object.assign(brick, additionalProps);
};

it('should create object with customChildren', () => {
  const brickWithoutChildren = addCustomChildren();
  const brickWithChildren = addCustomChildren((value) => ({ brick: 'test', children: value }));

  expect(brickWithoutChildren.customChildren).toHaveLength(0);
  expect(brickWithChildren.customChildren).toHaveLength(1);
  expect(brickWithChildren.customChildren[0]('lorem')).toMatchObject({
    brick: 'test',
    children: 'lorem',
  });
});

it('should check if a brick has customChildren', () => {
  const brickWithoutChildren = createBrick();
  const brickWithChildren = createBrick({
    customChildren: [],
  });

  expect(hasCustomChildren(brickWithoutChildren)).toBeFalsy();
  expect(hasCustomChildren(brickWithChildren)).toBeTruthy();
});

it('should return false for wrong values', () => {
  const values = [
    null,
    undefined,
    Symbol('test'),
    {},
    [],
    () => {},
    { customChildren: [] }, // it's not a brick but it has slots
    NaN,
    0,
    10,
    'lorem ipsum',
  ];

  values.forEach((value) => expect(hasCustomChildren(value)).toBeFalsy());
});
