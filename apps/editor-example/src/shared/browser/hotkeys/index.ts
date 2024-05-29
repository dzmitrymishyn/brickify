const isff = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase().indexOf('firefox') > 0 : false;

// Special Keys
const KEY_MAP = {
  backspace: 8,
  '⌫': 8,
  tab: 9,
  clear: 12,
  enter: 13,
  '↩': 13,
  return: 13,
  esc: 27,
  escape: 27,
  space: 32,
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  del: 46,
  delete: 46,
  ins: 45,
  insert: 45,
  home: 36,
  end: 35,
  pageup: 33,
  pagedown: 34,
  capslock: 20,
  num_0: 96,
  num_1: 97,
  num_2: 98,
  num_3: 99,
  num_4: 100,
  num_5: 101,
  num_6: 102,
  num_7: 103,
  num_8: 104,
  num_9: 105,
  num_multiply: 106,
  num_add: 107,
  num_enter: 108,
  num_subtract: 109,
  num_decimal: 110,
  num_divide: 111,
  '⇪': 20,
  ',': 188,
  '.': 190,
  '/': 191,
  '`': 192,
  '-': isff ? 173 : 189,
  '=': isff ? 61 : 187,
  ';': isff ? 59 : 186,
  '\'': 222,
  '[': 219,
  ']': 221,
  '\\': 220,
} as const;

const shift = (event: KeyboardEvent) => event.shiftKey;
const ctrl = (event: KeyboardEvent) => event.ctrlKey;
const cmd = (event: KeyboardEvent) => event.metaKey;
const option = (event: KeyboardEvent) => event.altKey;

const MODIFIERS_CHEKCKERS = {
  // shiftKey
  '⇧': shift,
  shift,
  // altKey
  '⌥': option,
  alt: option,
  option,
  // ctrlKey
  '⌃': ctrl,
  ctrl,
  control: ctrl,
  // metaKey
  '⌘': cmd,
  cmd,
  command: cmd,
} as const;

const splitAndTrim = (line: string, separator: string) => line
  .split(separator)
  .map((subline) => subline.trim());

const code = (event: KeyboardEvent) => {
  const key = event.keyCode || event.which || event.charCode;

  if (key === 93 || key === 224) {
    return 91;
  }

  return key;
};

export const match = (event: Event, shortcut: string) => {
  if (!(event instanceof KeyboardEvent)) {
    return false;
  }

  return splitAndTrim(shortcut, '+')
    .every((key) => (
      MODIFIERS_CHEKCKERS[key as keyof typeof MODIFIERS_CHEKCKERS]
      || (
        KEY_MAP[key as keyof typeof KEY_MAP]
        && code(event) === KEY_MAP[key as keyof typeof KEY_MAP]
      )
    ) || code(event) === key.toUpperCase().charCodeAt(0));
};
