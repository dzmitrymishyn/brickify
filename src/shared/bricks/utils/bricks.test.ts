import { isBrick } from './bricks';

it('should return true on brick', () => {
  const brick1 = () => null;
  brick1.brick = 'test';
  const brick2 = () => null;
  brick2.brick = Symbol('test');

  expect(isBrick(brick1)).toBeTruthy();
  expect(isBrick(brick2)).toBeTruthy();
});

it('should return false on non-brick values', () => {
  const notBrick = () => null;
  notBrick.brick = 123; // suppose to be string or Symbol
  const values = [
    () => null, // it's a component but without brick
    notBrick,
    null,
    undefined,
    Symbol('test'),
    {},
    [],
    () => {},
    { slots: {} },
    NaN,
    0,
    10,
    'lorem ipsum',
  ];

  values.forEach((value) => expect(isBrick(value)).toBeFalsy());
});
