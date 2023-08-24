import { closestUntilChildOfParent, getSibling } from '../traverse';

export const wrapToNode = (
  wrapper: Element,
  start: Node,
  end: Node | null = null,
  ltr: boolean = true,
) => {
  let child: Node | null = start;

  const parent = child.parentNode!;
  const startSibling = getSibling(start, !ltr);
  const endSibling = getSibling(end, ltr);

  do {
    const nextSibling = getSibling(child, ltr);
    wrapper.insertBefore(child, ltr ? null : wrapper.childNodes[0]);
    if (child === end) {
      break;
    }
    child = nextSibling;
  } while (child);

  const parentsChild = ltr
    ? endSibling && closestUntilChildOfParent(endSibling, parent)
    : startSibling && closestUntilChildOfParent(startSibling, parent);

  parent.insertBefore(wrapper, parentsChild);
};
