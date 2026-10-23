type Attrs = Record<string, string | number | boolean | undefined>;
type Child = Node | string | null | undefined | false;

/**
 * Tiny element builder. Text is always set via text nodes, never innerHTML,
 * so content can't inject markup.
 */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === false) continue;
    if (key === "className") node.className = String(value);
    else node.setAttribute(key, value === true ? "" : String(value));
  }
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    node.append(typeof child === "string" ? document.createTextNode(child) : child);
  }
  return node;
}

export function clear(node: Element): void {
  node.replaceChildren();
}

export function requireElement<T extends Element>(selector: string): T {
  const node = document.querySelector<T>(selector);
  if (!node) throw new Error(`Missing element ${selector}`);
  return node;
}

/**
 * Enables declarative `closedby="any"` light-dismiss on a modal `<dialog>`
 * along with the click-outside fallback for browsers without native `closedBy`
 * support (such as WebKit/Safari).
 */
export function enableDialogLightDismiss(dialog: HTMLDialogElement): void {
  dialog.setAttribute("closedby", "any");
  if (!("closedBy" in HTMLDialogElement.prototype)) {
    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const isDialogContent =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.width + rect.left;
      if (isDialogContent) return;
      dialog.close();
    });
  }
}
