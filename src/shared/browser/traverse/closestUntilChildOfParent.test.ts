import { screen } from '@testing-library/dom';

import { closestUntilChildOfParent } from './closestUntilChildOfParent';

const createDom = () => {
  document.body.innerHTML = `
    <div data-testid="container">
      <ul>
        <li>
          hello world
          <i>
            lorem ipsum
          </i>
        </li>
        <li>
          <u>dolar sit amet</u>
        </li>
      </ul>
    </div>
    <div data-testid="outsider"></div>
  `;

  const container = screen.getByTestId('container');
  const outsider = screen.getByTestId('outsider');

  return { container, outsider };
};

it('should return List element in DOM', () => {
  const { container } = createDom();
  const expected = screen.getByRole('list');
  const child1 = screen.getByText(/lorem ipsum/);
  const child2 = screen.getByText(/dolar sit amet/);

  expect(closestUntilChildOfParent(child1, container)).toBe(expected);
  expect(closestUntilChildOfParent(child2, container)).toBe(expected);
});

it('should return null if the node is outside of the container', () => {
  const { container, outsider } = createDom();

  expect(closestUntilChildOfParent(outsider, container)).toBeNull();
});
