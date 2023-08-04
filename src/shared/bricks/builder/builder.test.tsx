import { render, screen } from '@testing-library/react';

import { make } from './builder';
import { component } from './component';

it('should make a brick with displayName', () => {
  const Component = make(
    component('test', () => (
      <div>
        test
      </div>
    )),
    { test1: 1 },
    { test2: 'test' },
    { test3: ['lorem'] },
    { test4: { test: 'test' } },
  );

  render(<Component />);

  const testElement = screen.getByText('test');

  expect(testElement).toBeInTheDocument();
  expect(Component).toHaveProperty('brick', 'test');
  expect(Component).toHaveProperty('test1', 1);
  expect(Component).toHaveProperty('test2', 'test');
  expect(Component).toHaveProperty('test3', ['lorem']);
  expect(Component).toHaveProperty('test4', { test: 'test' });
  expect(Component).toHaveProperty('displayName', 'Test');
});

it('should not mutate the previous component', () => {
  const ComponentOld = component('test', () => null);
  const ComponentNew = make(
    ComponentOld,
    { test1: 1 },
  );

  expect(ComponentOld).not.toHaveProperty('test1', 1);
  expect(ComponentNew).toHaveProperty('test1', 1);
  expect(ComponentNew).not.toBe(ComponentOld);
});
