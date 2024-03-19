export const revertDomByMutations = (mutations: MutationRecord[]) => {
  for (let i = mutations.length - 1; i >= 0; i -= 1) {
    const mutation = mutations[i];
    switch (mutation.type) {
      case 'characterData': {
        // eslint-disable-next-line no-param-reassign
        mutation.target.textContent = mutation.oldValue;
        break;
      }
      case 'childList': {
        if (mutation.removedNodes.length) {
          mutation.target.insertBefore(mutation.removedNodes[0], mutation.nextSibling);
        }

        if (mutation.addedNodes.length) {
          mutation.addedNodes.forEach((node) => mutation.target.removeChild(node));
        }

        break;
      }
      case 'attributes': {
        const name = mutation.attributeName!;
        const target = mutation.target as HTMLElement;
        if (!mutation.oldValue) {
          target.removeAttribute(name);
        } else {
          target.setAttribute(name, mutation.oldValue);
        }
        break;
      }
      default: break;
    }
  }
};
