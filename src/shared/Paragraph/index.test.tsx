import { render, screen } from '@testing-library/react';

import Paragraph from './index';

it('should render Paragraph', () => {
  render(<Paragraph>lorem ipsum</Paragraph>);

  const container = screen.getByText(/lorem ipsum/i);

  expect(container).toBeInTheDocument();
  expect(container).toHaveAttribute('data-brick', 'paragraph');
});

