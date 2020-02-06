export function contentType(type: string) {
  if (type === 'json') {
    return 'application/json';
  } else {
    return 'application/xml';
  }
}


export function updateData(updated: any, old: any) {
  Object.assign(old, updated);
}

export enum Insert {
  CHILD = "asFirstChild",
  LEFT = "asLeftSibling",
  RIGHT = "asRightSibling",
  REPLACE = "replace"
}