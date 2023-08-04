import { addSlots, hasSlots } from './slots';

const createBrick = (additionalProps: object = {}) => {
  const brick = () => null;
  brick.brick = 'test';
  brick.is = () => true;
  brick.parseValue = () => null;
  return Object.assign(brick, additionalProps);
};

it('should generate right object with slots', () => {
  const brick = addSlots({
    children: 'inherit',
    header: [createBrick()],
    footer: [],
  });

  expect(brick).toHaveProperty('slots.children', undefined);
  expect(brick).toHaveProperty('slots.header.test');
  expect(typeof brick.slots.header.test).toBe('function');
  expect(brick).toHaveProperty('slots.footer', {});
});

it('should check if a brick has slots', () => {
  const brickWithoutSlots = createBrick();
  const brickWithSlots = createBrick({
    slots: {
      children: undefined,
    },
  });

  expect(hasSlots(brickWithoutSlots)).toBeFalsy();
  expect(hasSlots(brickWithSlots)).toBeTruthy();
});

it('should return false for wrong values', () => {
  const values = [
    null,
    undefined,
    Symbol('test'),
    {},
    [],
    () => {},
    { slots: {} }, // it's not a brick but it has slots
    NaN,
    0,
    10,
    'lorem ipsum',
  ];

  values.forEach((value) => expect(hasSlots(value)).toBeFalsy());
});
