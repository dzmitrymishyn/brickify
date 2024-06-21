import { type ComponentType } from 'react';

import { BrickContext } from './BrickContext';
import { EmptyLogger } from '../logger';

type Props = {
  logger?: Console;
};

export function withBrickContext<P = object>(Component: ComponentType<P>) {
  const WithBrickContext: React.FC<P & Props> = ({
    logger = EmptyLogger,
    ...props
  }) => {
    return (
      <BrickContext.Provider value={{ logger }}>
        <Component {...props as P & JSX.IntrinsicAttributes} />
      </BrickContext.Provider>
    );
  };

  WithBrickContext.displayName = `WithBrickContext(${Component.displayName ?? 'Unnamed'})`;

  return WithBrickContext;
};
