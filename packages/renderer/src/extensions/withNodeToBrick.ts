import { type Component } from '../components';

export type NodeToBrickOptions = {
  components?: Record<string, Component>;
  component: Component;
};

export const withNodeToBrick = (
  format: (node: Node, options: NodeToBrickOptions) => unknown
) => ({ nodeToBrick: format });

export const hasNodeToBrick = (
  component: unknown,
): component is { nodeToBrick: <T>(node: Node, options: NodeToBrickOptions) => T } => Boolean(
  (typeof component === 'function' || typeof component === 'object')
  && component
  && 'nodeToBrick' in component
  && typeof component.nodeToBrick === 'function'
);
