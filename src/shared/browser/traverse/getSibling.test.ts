import { screen } from '@testing-library/dom';

import { getSibling } from './getSibling';

const createDom = () => {
  document.body.innerHTML = `
    <div data-testid="container">hello<br />world<i>lorem ipsum</i></div>
  `;

  const container = screen.getByTestId('container');

  return { container };
};

it('should get next sibling', () => {
  const { container } = createDom();

  let current: Node | null = container.childNodes[0];

  current = getSibling(current, true);
  expect(current).toHaveProperty('tagName', 'BR');
  current = getSibling(current, true);
  expect(current).toHaveProperty('nodeType', Node.TEXT_NODE);
  current = getSibling(current, true);
  expect(current).toHaveProperty('tagName', 'I');
  current = getSibling(current, true);
  expect(current).toBeNull();
});

it('should get previous sibling', () => {
  const { container } = createDom();

  let current: Node | null = container.childNodes[3];

  current = getSibling(current, false);
  expect(current).toHaveProperty('nodeType', Node.TEXT_NODE);
  current = getSibling(current, false);
  expect(current).toHaveProperty('tagName', 'BR');
  current = getSibling(current, false);
  expect(current).toHaveProperty('nodeType', Node.TEXT_NODE);
  current = getSibling(current, false);
  expect(current).toBeNull();
});

it('should get null on null', () => {
  expect(getSibling(null, true)).toBeNull();
  expect(getSibling(null, false)).toBeNull();
});
