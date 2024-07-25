export const next = (path: string[]) => {
  const newPath = [...path];
  const lastElement = newPath.at(-1);

  newPath[newPath.length - 1] = `${Number(lastElement) + 1}`;

  return newPath;
};
