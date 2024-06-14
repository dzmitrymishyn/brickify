import { add } from './add';
import { type Node } from './node';

let emptyNode: Node;

it('should emit an error on wrong parent', () => {
  expect(() => add(emptyNode, 'test', emptyNode))
    .toThrow('Parent should be specified');
});

it('should throw an error for an unknown slot', () => {
  const parentNode = { value: {}, slots: {} };
  const childNode = { value: {}, slots: {} };

  expect(() => add(parentNode, 'unknownSlot', childNode))
    .toThrow('Slot should be in the parent');
});

it('should add child in an expected slot', () => {
  const parentNode = {
    value: {},
    slots: { test: [] },
  };
  const childNode = { value: {}, slots: {} };

  add(parentNode, 'test', childNode);

  expect(parentNode).toMatchObject({
    value: {},
    slots: {
      test: [{
        value: {},
        slots: {},
      }],
    },
  });
});
