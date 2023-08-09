import { isElement } from './element';

it('should identify Element', () => {
  const elements = [
    document.createElement('div'),
    document.createElement('ul'),
    document.createElement('ol'),
    document.createElement('span'),
    document.createElement('strong'),
    document.createElement('em'),
    document.createElement('u'),
    document.body,
  ];

  elements.forEach((element) => expect(isElement(element)).toBeTruthy());
});

it('should return false on non-elements', () => {
  const elements = [
    document.createComment('random comment'),
    document.createTextNode('lorem ipsum'),
  ];

  elements.forEach((element) => expect(isElement(element)).toBeFalsy());
});
