import { compile } from 'css-select';
import React, { PropsWithChildren } from 'react';

import { extend } from '@/shared/bricks';

const Em: React.FC<PropsWithChildren> = ({ children }) => (
  <em>{children}</em>
);

export default extend(Em, { is: compile('em') });
