import { screen } from '@testing-library/dom';

import { clearSiblings } from './clearSiblings';

const createDocument = () => {
  document.body.innerHTML = `
    <nav>
      <strong>It's menu</strong>
      <ul>
        <li><a href="/">home</a></li>
      </ul>
    </nav>
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
    <aside>
      <strong>It's aside</strong>
    </aside>
    <footer>
      <strong>
        It's
        <strong>footer</strong>
      </strong>
    </footer>
  `;
};

it('should remove all strong element from all the siblings', () => {
  createDocument();

  const firstSibling = screen.getByRole('navigation');

  clearSiblings('strong', firstSibling);

  expect(document.querySelector('strong')).toBeNull();
});

it('should remove strong only in main and aside', () => {
  createDocument();

  const navigation = screen.queryByRole('navigation')!;
  const main = screen.queryByRole('main')!;
  const aside = screen.queryByRole('complementary')!;
  const footer = screen.queryByRole('contentinfo')!;

  clearSiblings('strong', main, footer);

  expect(navigation.querySelector('strong')).not.toBeNull();
  expect(main.querySelector('strong')).toBeNull();
  expect(aside.querySelector('strong')).toBeNull();
  expect(footer.querySelector('strong')).not.toBeNull();
});

it('should not remove strong for the same node', () => {
  createDocument();

  const main = screen.queryByRole('main')!;

  clearSiblings('strong', main, main);

  expect(main.querySelector('strong')).not.toBeNull();
});

it('should leave right html code', () => {
  document.body.innerHTML = '<div>Hello <strong>stranger</strong>!</div>';

  clearSiblings('strong', document.body);

  expect(document.body).toContainHTML('<div>Hello stranger!</div>');
});

it('should leave right html code for siblings', () => {
  document.body.innerHTML = '<div>Hello <strong>stranger</strong>! Your <strong>profile</strong> is ready</div>';

  const firstStrong = screen.getByText('stranger');

  clearSiblings('strong', firstStrong);

  expect(document.body).toContainHTML('<div>Hello stranger! Your profile is ready</div>');
});

it('should not remove other types of nodes', () => {
  document.body.innerHTML = '<div><em>Hello</em> <u><strong>stranger</strong></u>! <span>Your <u>profile</u> is <em>ready</em></div>';

  const firstStrong = screen.getByText('stranger');

  clearSiblings('strong', firstStrong);

  expect(document.body).toContainHTML(
    '<div><em>Hello</em> <u>stranger</u>! <span>Your <u>profile</u> is <em>ready</em></div>',
  );
});
