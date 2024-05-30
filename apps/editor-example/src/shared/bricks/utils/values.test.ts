import { isBrickValue } from './values';

it('should return true on brick value', () => {
  expect(isBrickValue({ brick: 'test' })).toBeTruthy();
  expect(isBrickValue({ brick: 'test', id: '123' })).toBeTruthy();
});

it('should declare the values are not brick values', () => {
  const values = [
    { brock: 'test' }, // typo: brock
    { brick: () => 'test' }, // brick should be a string
    null,
    undefined,
    Symbol('test'),
    {},
    [],
    () => true,
    { slots: {} },
    NaN,
    0,
    10,
    'lorem ipsum',
  ];

  values.forEach((value) => { expect(isBrickValue(value)).toBeFalsy(); });
});
