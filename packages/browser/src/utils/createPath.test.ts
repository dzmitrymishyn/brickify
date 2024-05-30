import { screen } from '@testing-library/dom';

import { createPath } from './createPath';

const createDocument = () => {
  document.body.innerHTML = ''
    + '<main>'
      + '<ul>'
        + '<li><strong>Lorem:</strong> ipsum dolar sit amet;</li>'
        + '<li>'
          + '<div>Lorem ipsum</div>'
          + '<div>dolar <strong data-testid="strong">sit</strong> amet.</div>'
        + '</li>'
      + '</ul>'
    + '</main>';
};

it('should return first deep leaf', () => {
  createDocument();

  expect(createPath(screen.getByTestId('strong'), document.body)).toHaveLength(5);
  expect(createPath(screen.getByRole('main'), document.body)).toHaveLength(1);
});
