export function contentType(type: string) {
  if (type === 'json') {
    return 'application/json';
  } else {
    return 'application/xml';
  }
}


export function updateData(updated: any, old: any) {
  for (let key in Object.keys(updated)) {
    old[key] = updated[key];
  }
}

export enum Insert {
  CHILD = "asFirstChild",
  LEFT = "asLeftSibling",
  RIGHT = "asRightSibling",
  REPLACE = "replace"
}