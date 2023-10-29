// TODO: Rename the method. It's not actually only "loop"
// It's smth like find method too.
export const loop = <T>(
  cb: (current: T, index: number) => void,
  next: (current: T, index: number) => T | null | undefined,
) => (item?: T | null): void => {
    let current: T | null | undefined | false = item;
    let index = 0;

    while (current !== null && current !== undefined) {
      cb(current, index);
      index += 1;
      current = next(current, index);
    }
  };
