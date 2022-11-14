const MAX_QUERY_STRING_LENGTH = 4000; // 4KB max length

module.exports = {
  isQueryTunnelingRequired: function(encodedQueryParamString) {
    return encodedQueryParamString.length > MAX_QUERY_STRING_LENGTH;
  }
}