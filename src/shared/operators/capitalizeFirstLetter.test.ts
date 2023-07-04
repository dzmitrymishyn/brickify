import { capitalizeFirstLetter } from './capitalizeFirstLetter';

describe('capitalizeFirstLetter operator', () => {
  test('first letter should be uppercase', () => {
    expect(capitalizeFirstLetter('hello')).toBe('Hello');
  });

  test('empty line should be empty line', () => {
    expect(capitalizeFirstLetter('')).toBe('');
  });

  test('handling wrong types', () => {
    const wrongInputs: any[] = [
      null,
      undefined,
      {},
      [],
      () => {},
      1,
      Symbol('test'),
    ];

    wrongInputs.forEach(
      (value) => expect(capitalizeFirstLetter(value)).toBe(''),
    );
  });
});
