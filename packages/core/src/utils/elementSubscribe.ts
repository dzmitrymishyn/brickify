export type Unsubscribe = () => void;

export type ElementSubscribe<Data> = (
  element: HTMLElement,
  data: Data,
) => Unsubscribe;
