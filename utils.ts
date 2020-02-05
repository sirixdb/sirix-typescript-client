export function contentType(type: string) {
  if (type.toLowerCase() === 'json') {
    return 'application/json';
  } else {
    return 'application/xml';
  }
}


export function updateData(updated: AuthData | DatabaseInfo[], old: AuthData | DatabaseInfo[]) {
  for (let key in Object.keys(updated)) {
    old[key] = updated[key];
  }
}