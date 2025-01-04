import { cloneElement, type ReactElement } from 'react';

import { type RendererStoreValue } from '../store';

export const cloneOrCreateElement = <T>(
  stored: RendererStoreValue<T> | null | undefined,
  isSame: (oldValue: T) => boolean,
  newElement: ReactElement<{ stored: RendererStoreValue }>,
) => {
  if (!stored?.react) {
    if ('stored' in newElement.props) {
      newElement.props.stored.react = newElement;
      newElement.props.stored.reactWithoutPlugins = newElement;
    }
    return newElement;
  }

  stored.pathRef.current = newElement.props.stored.pathRef.current;

  if (isSame(stored.value)) {
    return stored.react;
  }

  Object.assign(stored, newElement.props.stored);

  const props = {
    ...stored.react.props,
    ...newElement.props,
    stored,
  };

  stored.react = cloneElement(stored.react, props);
  stored.reactWithoutPlugins = stored.react;

  return stored.react;
};
