export const loopUntil = <T>(
  cb: (current: T, index: number) => boolean | null | undefined,
  next: (current: T, index?: number) => T | null | undefined | false,
) => (item?: T | null): T | null => {
    let current: T | null | undefined | false = item;
    let index = 0;

    while (current) {
      if (cb(current, index)) {
        return current;
      }

      current = next(current, index);
      index += 1;
    }

    return null;
  };
