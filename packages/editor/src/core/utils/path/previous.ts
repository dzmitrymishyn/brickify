export const previous = (path: string[]) => {
  const newPath = [...path];
  const lastElement = newPath.at(-1);
  const previousIndex = Number(lastElement) - 1;

  newPath[newPath.length - 1] = `${previousIndex <= 0 ? 0 : previousIndex}`;

  return newPath;
};
