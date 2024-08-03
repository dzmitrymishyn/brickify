export type PathRangeItem = {
  path: string[];
  offset: number;
};

export type PathRange = {
  start: PathRangeItem;
  end: PathRangeItem;
};
