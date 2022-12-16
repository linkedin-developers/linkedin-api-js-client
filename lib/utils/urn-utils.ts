export function createUrnFromAttrs(type: string, id: string | number, namespace = 'li'): string {
  return `urn:${namespace}:${type}:${id}`;
}
