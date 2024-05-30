import { expose } from './expose';
import { Component } from './models';
import { surround } from './surround';
import { closest } from '../traverse';

export const reshape = (
  component: Component,
  range: Range,
  container?: HTMLElement | null,
) => (
  closest(range.startContainer, component.selector, container)
    ? expose(component, range, container)
    : surround(component, range)
);
