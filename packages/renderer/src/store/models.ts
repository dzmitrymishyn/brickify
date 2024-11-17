import { type ReactElement } from 'react';

import { type BrickValue } from '../bricks';
import { type PathRef } from '../utils';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any --
 * value might be anything and to simplify work it's better to use any type.
 * Each place that uses it should identify its type.
 */
export type RendererStoreValue<Value = any> = {
  /**
   * The value associated with this item. Usually we don't mutate the original
   * object and it's just a link. For primitive types we can transform it
   * in an object but it depends on a developer's implementation.
   */
  value: Value;

  /**
   * Represents DOM node for a rendered element.
   */
  domNode?: Node;

  /**
   * A ref to the path within the tree. This is used for efficient updates
   * and tracking
   */
  pathRef: PathRef;

  /**
   * react element that is used for caching purposes. Could be undefined on
   * the rendering phase
   */
  react?: ReactElement;
};


export type PropsWithStoredValue<Value extends object = BrickValue> = {
  stored: RendererStoreValue<Value>;
};
