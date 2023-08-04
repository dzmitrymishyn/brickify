import { render, screen } from '@testing-library/react';

import Paragraph from './index';

it('should render Paragraph', () => {
  render(<Paragraph>lorem ipsum</Paragraph>);

  const container = screen.getByText(/lorem ipsum/i);

  expect(container).toBeInTheDocument();
  expect(container).toHaveAttribute('data-brick', 'paragraph');
});

it('should make a new brick with new name and component', () => {
  const Text = Paragraph.of('text', 'main');

  render(<Text>lorem ipsum</Text>);

  const container = screen.getByRole('main');

  expect(container).toBeInTheDocument();
  expect(container).toHaveAttribute('data-brick', 'text');
});
