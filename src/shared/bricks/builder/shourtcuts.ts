import { Brick, isBrick } from '../utils';

export type Shortcut = {
  name?: string;
  apply: Function;
};

export type ShortcutsMap = Record<string, Shortcut>;

export type BrickWithShortcuts = {
  shortcuts: ShortcutsMap;
};

export const addShortcuts = (shortcuts: ShortcutsMap): BrickWithShortcuts => ({
  shortcuts,
});

export const hasShortcuts = (brick: unknown): brick is Brick & BrickWithShortcuts => isBrick(brick)
  && 'shortcuts' in brick
  && !!brick.shortcuts
  && typeof brick.shortcuts === 'object';
