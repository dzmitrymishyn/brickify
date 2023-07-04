import { array } from './array';

describe('array operator', () => {
  test('a single value should transform to array', () => {
    const singleValues = [
      null,
      undefined,
      { hello: 'world' },
      1,
      'hello',
      () => {},
    ];

    singleValues.forEach((value) => {
      expect(array(value)).toMatchObject([value]);
    });
  });

  test('an array should stay the array', () => {
    expect(array(['hello', 'world'])).toMatchObject(['hello', 'world']);
  });

  test('an empty arguments should transform to empty array', () => {
    expect(array()).toMatchObject([]);
  });
});
