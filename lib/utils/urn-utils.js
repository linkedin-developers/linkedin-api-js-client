function createUrnFromAttrs(type, id, namespace = 'li') {
  return `urn:${namespace}:${type}:${id}`;
}

module.exports = {
  createUrnFromAttrs
}