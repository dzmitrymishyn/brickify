import { type Component } from '../components';
import { hasMatcher } from '../extensions';

export type HandleAddedNodesOptions = {
  add: (options: {
    node: Node;
    index: number;
    component?: Component;
  }) => void;
  allNodes: Node[];
  addedNodes: Node[];
  components?: Record<string, Component>;
};

export const handleAddedNodes = ({
  add,
  allNodes,
  addedNodes,
  components = {},
}: HandleAddedNodesOptions): void => {
  if (!addedNodes.length) {
    return;
  }

  let addedItemsCount = 0;
  const componentsArray = Object.values(components);

  allNodes.find((node, index) => {
    if (!addedNodes.includes(node)) {
      return;
    }

    const Component = componentsArray.find((component) => (
      hasMatcher(component) && component.is(node)
    ));

    add({ node, index: index - addedItemsCount, component: Component });
    addedItemsCount += 1;

    return addedItemsCount === addedNodes.length;
  });
};
