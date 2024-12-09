export type PathRangeItem = {
  path: string[]; // path in tree to a component
  offset: number; // offset inside the component
};

export type PathRange = {
  start: PathRangeItem;
  end: PathRangeItem;
};
