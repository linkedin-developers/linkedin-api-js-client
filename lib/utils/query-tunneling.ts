const MAX_QUERY_STRING_LENGTH = 4000; // 4KB max length

export function isQueryTunnelingRequired(encodedQueryParamString: string) {
  return encodedQueryParamString.length > MAX_QUERY_STRING_LENGTH;
}