import { render } from '@testing-library/react';

import Page from './page';

it('should render the page', () => {
  const { container } = render(<Page />);
  expect(container).toBeInTheDocument();
});
