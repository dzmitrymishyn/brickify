import { tap } from './tap';

it('should call fn and return the passed value', () => {
  const mockCallback = jest.fn(() => true);

  expect(tap(mockCallback)(1)).toBe(1);
  expect(tap(mockCallback)(null)).toBe(null);

  const mockedObj = {};
  expect(tap(mockCallback)(mockedObj)).toBe(mockedObj);

  expect(mockCallback.mock.calls).toHaveLength(3);
});

it('should pass the arguments into callback', () => {
  const mockCallback = jest.fn((a: unknown) => a);

  expect(tap(mockCallback)(1)).toBe(1);
  expect(mockCallback.mock.calls[0][0]).toBe(1);

  expect(tap(mockCallback)(null)).toBe(null);
  expect(mockCallback.mock.calls[1][0]).toBe(null);

  const mockedObj = {};
  expect(tap(mockCallback)(mockedObj)).toBe(mockedObj);
  expect(mockCallback.mock.calls[2][0]).toBe(mockedObj);
});
