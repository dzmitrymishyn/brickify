import { of } from './of';

it('should create a node with specified slots', () => {
  expect(of({ test: 1 }, ['slot1', 'slot2'])).toMatchObject({
    value: { test: 1 },
    slots: {
      slot1: [],
      slot2: [],
    },
  });
});

it('should create a node without slots', () => {
  expect(of({ test: 1 })).toMatchObject({
    value: { test: 1 },
    slots: {},
  });
});
