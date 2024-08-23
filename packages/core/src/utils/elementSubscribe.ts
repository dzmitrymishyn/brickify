export type Unsubscribe = () => void;

export type ElementSubscribe<Data> = (
  element: HTMLElement,
  data: Data,
) => Unsubscribe;

export const subscribeFactory = <Fn extends (...args: any[]) => void>(
  store: Map<Node, Fn>,
) => {
  return (node: Node, fn: Fn) => {
    store.set(node, fn);
    return () => {
      store.delete(node);
    };
  };
};
