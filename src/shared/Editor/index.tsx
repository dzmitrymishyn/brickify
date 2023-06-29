'use client';

import { brick, component, factory } from '@/shared/bricks';

function of<Name extends string>(name: Name) {
  return brick(
    component(
      name,
      () => (
        <div>Editor</div>
      ),
    ),
    factory(of),
  );
}

export default of('editor');
