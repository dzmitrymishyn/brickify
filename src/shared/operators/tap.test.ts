import { tap } from './tap';

describe('tap operator', () => {
  test('a function is called and the value passed as a result', () => {
    const mockCallback = jest.fn(() => {});

    expect(tap(mockCallback)(1)).toBe(1);
    expect(tap(mockCallback)(null)).toBe(null);

    const mockedObj = {};
    expect(tap(mockCallback)(mockedObj)).toBe(mockedObj);

    expect(mockCallback.mock.calls).toHaveLength(3);
  });

  test('the argument are passed in the callback', () => {
    const mockCallback = jest.fn((a: unknown) => a);

    expect(tap(mockCallback)(1)).toBe(1);
    expect(mockCallback.mock.calls[0][0]).toBe(1);

    expect(tap(mockCallback)(null)).toBe(null);
    expect(mockCallback.mock.calls[1][0]).toBe(null);

    const mockedObj = {};
    expect(tap(mockCallback)(mockedObj)).toBe(mockedObj);
    expect(mockCallback.mock.calls[2][0]).toBe(mockedObj);
  });
});
