import { forwardRef } from 'react';
import { getName } from './getName';

it('should return brick name for a component', () => {
  const Component = () => null;
  Component.displayName = 'displayName';
  Component.brick = 'brick';

  expect(getName(Component)).toBe('brick');
});

it('should return displayName when do not have brick', () => {
  const Component = () => null;
  Component.displayName = 'displayName';

  expect(getName(Component)).toBe('displayName');
});

it('should return name when do not have brick and displayName', () => {
  const Component = () => null;

  expect(getName(Component)).toBe('Component');
});

it('should throw an error for unnamed component', () => {
  expect(() => getName(() => null)).toThrow();
});

it('should return displayName for a forwardRef', () => {
  const Component = forwardRef(() => null);
  Component.displayName = 'ForwardRefComponent';
  expect(getName(Component)).toBe('ForwardRefComponent');
});

it('should throw an error for forwardRef component without name', () => {
  const Component = forwardRef(() => null);
  expect(() => getName(Component)).toThrow();
});
