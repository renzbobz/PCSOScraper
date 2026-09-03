import type { ChildNode, Element } from "domhandler";

interface SimpleSelector {
  tag?: string;
  id?: string;
  classes: string[];
}

function parseSelector(selector: string): SimpleSelector {
  const result: SimpleSelector = {
    classes: [],
  };

  let value = selector.trim();

  // Extract tag name.
  const tagMatch = value.match(/^[a-zA-Z][a-zA-Z0-9_-]*/);

  if (tagMatch) {
    result.tag = tagMatch[0].toLowerCase();
    value = value.slice(tagMatch[0].length);
  }

  // Extract #id and .class selectors.
  const parts = value.match(/([.#])([a-zA-Z0-9_-]+)/g);

  if (parts) {
    for (const part of parts) {
      if (part[0] === "#") {
        result.id = part.slice(1);
      } else if (part[0] === ".") {
        result.classes.push(part.slice(1));
      }
    }
  }

  return result;
}

function matchesSelector(
  element: Element,
  selector: string,
): boolean {
  const parsed = parseSelector(selector);

  // Tag
  if (
    parsed.tag &&
    element.name.toLowerCase() !== parsed.tag
  ) {
    return false;
  }

  // ID
  if (
    parsed.id &&
    element.attribs.id !== parsed.id
  ) {
    return false;
  }

  // Classes
  if (parsed.classes.length) {
    const elementClasses = (
      element.attribs.class ?? ""
    )
      .split(/\s+/)
      .filter(Boolean);

    for (const className of parsed.classes) {
      if (!elementClasses.includes(className)) {
        return false;
      }
    }
  }

  return true;
}

function findElements(
  root: ChildNode,
  selector: string,
): Element[] {
  const result: Element[] = [];

  function walk(node: ChildNode) {
    if (
      node.type === "tag" &&
      matchesSelector(node, selector)
    ) {
      result.push(node);
    }

    if ("children" in node && node.children) {
      for (const child of node.children) {
        walk(child);
      }
    }
  }

  walk(root);

  return result;
}

/**
 * Lightweight querySelectorAll implementation.
 *
 * Supported:
 *
 *   tag
 *   .class
 *   #id
 *   tag.class
 *   tag#id
 *   tag.class#id
 *   tag tag
 *   tag > tag
 *   .class .class
 *   #id .class
 */
export function querySelectorAll(
  root: ChildNode,
  selector: string,
): Element[] {
  selector = selector.trim();

  if (!selector) {
    return [];
  }

  /*
   * Split selector into relationship parts.
   *
   * Examples:
   *
   * "div span"
   * ["div", "span"]
   *
   * "div > span"
   * ["div", ">", "span"]
   */
  const tokens = selector
    .replace(/>/g, " > ")
    .trim()
    .split(/\s+/);

  if (!tokens.length) {
    return [];
  }

  let current = findElements(root, tokens[0]);

  let i = 1;

  while (i < tokens.length) {
    const directChild = tokens[i] === ">";

    const selectorPart = directChild
      ? tokens[++i]
      : tokens[i];

    if (!selectorPart) {
      break;
    }

    const next: Element[] = [];

    for (const element of current) {
      if (directChild) {
        /*
         * Direct child:
         *
         * div > span
         */
        for (const child of element.children) {
          if (
            child.type === "tag" &&
            matchesSelector(
              child,
              selectorPart,
            )
          ) {
            next.push(child);
          }
        }
      } else {
        /*
         * Descendant:
         *
         * div span
         */
        next.push(
          ...findElements(
            element,
            selectorPart,
          ),
        );
      }
    }

    current = next;
    i++;
  }

  return current;
}

/**
 * Get textContent from an htmlparser2 node.
 */
export function textContent(
  node: ChildNode,
): string {
  let result = "";

  function walk(current: ChildNode) {
    if (current.type === "text") {
      result += current.data;
      return;
    }

    if ("children" in current && current.children) {
      for (const child of current.children) {
        walk(child);
      }
    }
  }

  walk(node);

  return result.trim();
}