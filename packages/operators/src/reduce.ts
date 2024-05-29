// TODO: Rename the method. It's not actually only "loop"
// It's smth like find method too.
export const reduce = <T, R>(
  initialAcc: R,
  cb: (acc: R, current: T, index: number) => [R, T | null | undefined | false],
) => (item?: T | null): R => {
    let current: T | null | undefined | false = item;
    let index = 0;
    let acc = initialAcc;

    while (current !== null && current !== undefined && current !== false) {
      [acc, current] = cb(acc, current, index);
      index += 1;
    }

    return acc;
  };
