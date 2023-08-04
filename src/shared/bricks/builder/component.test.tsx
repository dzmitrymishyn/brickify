import { render, screen } from '@testing-library/react';

import { component } from './component';

it('should generate brick with appropriate data', () => {
  const Component = component('test', (props: { data: string }) => (
    <div data-testid="1">
      Hello world
      <button>{props.data}</button>
    </div>
  ));

  render(<Component data="lorem" />);

  const container = screen.getByTestId(1);
  const button = screen.getByRole('button', {
    name: /lorem/i,
  });

  expect(container).toBeInTheDocument();
  expect(button).toBeInTheDocument();
  expect(Component.brick).toBe('test');
  expect(Component.displayName).toBe('Test');
});

it('should create a new component', () => {
  const ComponentBase = () => null;
  const ComponentOld = component('test', ComponentBase);

  expect(ComponentOld).not.toBe(ComponentBase);
});


it('should create unnamed component', () => {
  const Component = component('', () => null);

  expect(Component.displayName).toBe('UnnamedBrick');
});

it('should add appropriate config to a brick', () => {
  const is = jest.fn(() => true);
  const parseValue = jest.fn(() => '');
  const Component = component('test', () => <div />, {
    is,
    parseValue,
  });

  const { container } = render(<Component />);

  Component.is(container);
  Component.parseValue('');

  expect(is).toBeCalled();
  expect(parseValue).toBeCalled();
});

it('should set appropriate default options', () => {
  const Component = component('test', () => <div />);

  const { container } = render(<Component />);

  expect(Component.is(container)).toBeFalsy();
  expect(Component.parseValue('')).toBe(null);
});
