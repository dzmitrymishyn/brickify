import { addFactory } from './factory';

it('should generate the object with `of` method', () => {
  const of = jest.fn(() => 'lorem ipsum');
  const brick = addFactory(of);

  brick.of();

  expect(of).toBeCalled();
  expect(of).toReturnWith('lorem ipsum');
});

it('should generate the same object by chaining', () => {
  type RecursiveOf = {
    brick: string;
    of(name: string): RecursiveOf;
  };

  const of: RecursiveOf['of'] = jest.fn((name: string) => ({ of, brick: name }));
  const brick = addFactory(of);

  brick.of('test1').of('test2').of('test3');

  expect(of).toBeCalledTimes(3);
  expect(of).lastReturnedWith({ of, brick: 'test3' });
});
