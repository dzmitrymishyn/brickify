import { expose } from './expose';
import { Component } from './models';
import { surround } from './surround';
import { closest } from '../traverse';

export const reshape = (
  component: Component,
  inputRange: Range,
  container?: HTMLElement | null,
) => (
  closest(inputRange.startContainer, component.selector, container)
    ? expose(component, inputRange, container)
    : surround(component, inputRange)
);
