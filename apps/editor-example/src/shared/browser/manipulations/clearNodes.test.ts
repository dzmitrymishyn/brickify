import { screen } from '@testing-library/dom';

import { clearNodes } from './clearNodes';

const createDocument = () => {
  document.body.innerHTML = `
    <main>
      <ul>
        <li><strong>Lorem:</strong> ipsum dolar sit amet;</li>
        <li>
          <div>Lorem ipsum</div>
          <div>dolar <strong>sit</strong> amet.</div>
        </li>
      </ul>
      <div><!-- empty div --></div>
      <div><i>Lorem</i> ipsum dolar <strong>sit</strong> amet.</div>
    </main>
  `;
};

it('should remove all strong element from the container', () => {
  createDocument();

  clearNodes(document.body, 'strong');

  expect(document.querySelector('strong')).toBeNull();
});

it('should remove strong only in list', () => {
  createDocument();

  const list = screen.queryByRole('list')!;

  clearNodes(list, 'strong');

  expect(document.querySelectorAll('strong')).toHaveLength(1);
  expect(list.querySelectorAll('strong')).toHaveLength(0);
});

it('should replace parent main with children', () => {
  createDocument();

  const main = screen.queryByRole('main')!;
  const children = Array.from(main.children);

  clearNodes(main, 'main', true);

  expect(screen.queryByRole('main')).not.toBeInTheDocument();
  Array.from(document.body.children).forEach((child, index) => {
    expect(child).toBe(children[index]);
  });
});

it('should NOT replace parent main with children', () => {
  createDocument();

  const main = screen.queryByRole('main')!;

  clearNodes(main, 'main');

  expect(screen.getByRole('main')).toBeInTheDocument();
});

it('should leave right html code', () => {
  document.body.innerHTML = '<div>Hello <strong>stranger</strong>!</div>';

  clearNodes(document.body, 'strong');

  expect(document.body).toContainHTML('<div>Hello stranger!</div>');
});

it('should remove only strong node', () => {
  document.body.innerHTML = '<div><em>Hello</em> <u><strong>stranger</strong></u>! <span>Your <u>profile</u> is <em>ready</em></div>';

  clearNodes(document.body, 'strong');

  expect(document.body).toContainHTML(
    '<div><em>Hello</em> <u>stranger</u>! <span>Your <u>profile</u> is <em>ready</em></div>',
  );
});
