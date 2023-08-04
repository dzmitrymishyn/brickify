import { render, renderHook, screen } from '@testing-library/react';

import { addSlots, component, make } from './builder';
import { useBricksBuilder } from './useBrickBuilder';

it('should generate right DOM', () => {
  const testBrick = component('test', ({ children }) => (
    <div>{children}</div>
  ));
  const brick = make(
    component('wrapper', () => null),
    addSlots({ children: [testBrick] }),
  );

  const { result } = renderHook(() => useBricksBuilder([
    { brick: 'test', children: 'test1' },
    { brick: 'tost', children: 'test2' }, // typo in brick name
    { brick: 'test', children: 'test3' },
  ], brick));

  render(<>{result.current}</>);

  expect(screen.getByText(/test1/)).toBeInTheDocument();
  expect(screen.queryByText(/test2/)).not.toBeInTheDocument();
  expect(screen.getByText(/test3/)).toBeInTheDocument();
});
