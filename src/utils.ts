export function contentType(type: string) {
  if (type === 'json') {
    return 'application/json';
  } else {
    return 'application/xml';
  }
}

export enum Insert {
  CHILD = "asFirstChild",
  LEFT = "asLeftSibling",
  RIGHT = "asRightSibling",
  REPLACE = "replace"
}