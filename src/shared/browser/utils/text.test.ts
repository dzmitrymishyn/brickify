import { screen } from '@testing-library/dom';

import { isText, splitBoundaryText, splitIfText } from './text';

describe('isText', () => {
  it('should identify Text', () => {
    expect(isText(document.createTextNode('lorem ipsum'))).toBeTruthy();
    expect(isText(document.createTextNode(''))).toBeTruthy();
  });

  it('should return false on non-Text nodes', () => {
    const elements = [
      document.createComment('random comment'),
      document.createElement('div'),
      document.createElement('ul'),
      document.createElement('ol'),
      document.createElement('span'),
      document.createElement('strong'),
      document.createElement('em'),
      document.createElement('u'),
      document.body,
    ];

    elements.forEach((element) => expect(isText(element)).toBeFalsy());
  });
});

describe('splitIfText', () => {
  it('shoud not split a text cause corner cases', () => {
    const element = document.createTextNode('lorem ipsum');

    expect(splitIfText(element, 0)).toBe(element);
    expect(splitIfText(element, element.textContent!.length)).toBe(element);
  });

  it('shoud not split a text cause out of range', () => {
    const element = document.createTextNode('lorem ipsum');

    expect(splitIfText(element, -1)).toBe(element);
    expect(splitIfText(element, -Infinity)).toBe(element);
    expect(splitIfText(element, NaN)).toBe(element);
    expect(splitIfText(element, 12)).toBe(element);
    expect(splitIfText(element, Infinity)).toBe(element);
  });

  it('shoud split a text and return a new text node', () => {
    const element = document.createTextNode('lorem ipsum');
    const newElement = splitIfText(element, 6);

    expect(newElement).not.toBe(element);
    expect(newElement.textContent).toBe('ipsum');
  });

  it('shoud do nothing for HTMLElements', () => {
    const element = document.createElement('div');
    const newElement = splitIfText(element, 6);

    expect(newElement).toBe(element);
  });
});

describe('splitBoundaryText', () => {
  const createDocument = () => {
    document.body.innerHTML = `
      <h1 data-testid="heading">Hello world</h1>
      <div data-testid="text">Lorem ipsum dolar sit amet</div>
    `;
  };

  it('shoud split TextNode', () => {
    createDocument();

    const div = screen.getByTestId('text').childNodes[0];
    const range = document.createRange();
    range.setStart(div, 6);
    range.setEnd(div, div.textContent!.length - 5);

    expect(splitBoundaryText(range).commonAncestorContainer.textContent).toBe('ipsum dolar sit');
  });

  it('shoud split text in multiple nodes', () => {
    createDocument();

    const node1 = screen.getByTestId('heading').childNodes[0];
    const node2 = screen.getByTestId('text').childNodes[0];

    const range = document.createRange();
    range.setStart(node1, 6);
    range.setEnd(node2, 5);
    const resultRange = splitBoundaryText(range);

    expect(resultRange.startContainer).toHaveTextContent(/^world$/i);
    expect(resultRange.endContainer).toHaveTextContent(/^lorem$/i);
  });

  it('shoud not to split not text elements', () => {
    createDocument();

    const node1 = screen.getByTestId('heading');
    const node2 = screen.getByTestId('text');

    const range = document.createRange();
    range.setStart(node1, 0);
    range.setEnd(node2, 0);
    const resultRange = splitBoundaryText(range);

    expect(resultRange.startContainer).toBe(node1);
    expect(resultRange.endContainer).toBe(node2);
  });

  it('shoud split only start container', () => {
    createDocument();

    const node1 = screen.getByTestId('heading').childNodes[0];
    const node2 = screen.getByTestId('text');

    const range = document.createRange();
    range.setStart(node1, 6);
    range.setEnd(node2, 0);
    const resultRange = splitBoundaryText(range);

    expect(resultRange.startContainer).toHaveTextContent(/^world$/i);
    expect(resultRange.endContainer).toBe(node2);
  });

  it('shoud split only end container', () => {
    createDocument();

    const node1 = screen.getByTestId('heading');
    const node2 = screen.getByTestId('text').childNodes[0];

    const range = document.createRange();
    range.setStart(node1, 0);
    range.setEnd(node2, 5);
    const resultRange = splitBoundaryText(range);

    expect(resultRange.startContainer).toBe(node1);
    expect(resultRange.endContainer).toHaveTextContent(/^lorem$/i);
  });
});
