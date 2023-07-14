export const generatedName = Symbol('generated');
export const makeGeneratedBrick = (value: unknown) => ({
  brick: generatedName,
  children: value,
});
