export const loopUntil = <T>(
  cb: (current: T, index?: number) => boolean | null | undefined,
  next: (current: T, previous?: T | null, index?: number) => T | null | undefined | false,
) => (item?: T | null): T | null => {
    let current: T | null | undefined | false = item;
    let previous = null;
    let index = 0;

    while (current) {
      if (cb(current, index)) {
        return current;
      }

      const temp = current;
      current = next(current, previous, index);
      index += 1;
      previous = temp;
    }

    return null;
  };
