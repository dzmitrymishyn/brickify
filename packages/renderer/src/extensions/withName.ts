import { withBrickName } from './withBrickName';
import { withDisplayName } from './withDisplayName';

export const withName = (name: string) => ({
  ...withDisplayName(name),
  ...withBrickName(name),
});
