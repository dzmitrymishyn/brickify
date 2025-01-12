import { withBrickName } from './withBrickName';
import { withDisplayName } from './withDisplayName';

export const withName = (name: string) => (
  context: Record<'brick' | 'displayName', string>,
) => ({
  ...withDisplayName(name)(context),
  ...withBrickName(name)(context),
});
