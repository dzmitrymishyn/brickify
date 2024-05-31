import { array } from './array';

it('should transform any single value to array', () => {
  const singleValues = [
    null,
    undefined,
    { hello: 'world' },
    1,
    'hello',
    () => true,
  ];

  singleValues.forEach((value) => {
    expect(array(value)).toMatchObject([value]);
  });
});

it('should not update the array', () => {
  expect(array(['hello', 'world'])).toMatchObject(['hello', 'world']);
});

it('should return an empty array', () => {
  expect(array()).toMatchObject([]);
});
