import { forwardRef } from 'react';

import { componentsToMap } from './componentsToMap';

const ComponentWithName = () => null;

const ComponentWithDisplayName = () => null;
ComponentWithDisplayName.displayName = 'ComponentWithDisplayName';

const ComponentWithBrickName = () => null;
ComponentWithBrickName.brick = 'ComponentWithBrickName';

const ComponentWithDifferentDisplayNameAndName = () => null;
ComponentWithDifferentDisplayNameAndName.displayName = 'displayName';

const ComponentWithDifferentBrickNameAndName = () => null;
ComponentWithDifferentBrickNameAndName.brick = 'brickName';

const RefComponentWithDisplayName = forwardRef(() => null);
RefComponentWithDisplayName.displayName = 'RefComponentWithDisplayName';

it('should prepare corresponding object for array of components', () => {
  expect(componentsToMap([
    ComponentWithName,
    ComponentWithDisplayName,
    ComponentWithBrickName,
    ComponentWithDifferentDisplayNameAndName,
    ComponentWithDifferentBrickNameAndName,
    RefComponentWithDisplayName,
  ])).toEqual({
    ComponentWithName,
    ComponentWithDisplayName,
    ComponentWithBrickName,
    displayName: ComponentWithDifferentDisplayNameAndName,
    brickName: ComponentWithDifferentBrickNameAndName,
    RefComponentWithDisplayName,
  });
});

it('should throw an error for a component without name', () => {
  expect(() => componentsToMap([() => null])).toThrow();
});

it('should return empty array if there are no components', () => {
  expect(componentsToMap()).toEqual({});
});
