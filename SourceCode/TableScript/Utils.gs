/**
 * Maps obj properties to string as url parameters.
 *
 * @param obj object to convert
 * @return parameter part of html
 */
function constructUrlParameters(obj) {
  var value = '';

  for (var prop in obj) {
    if (value) {
      value += '&';
    } else {
      value = '?';
    }
    value += prop + '=' + rfc3986EncodeURIComponent(obj[prop]);
  }
  return value;
}

/**
 * Encodes URI component.
 *
 * @param str string to encode
 * @return rfc3986 URI component
 */
function rfc3986EncodeURIComponent(str) {
  var v = '';
  try {
    v = encodeURIComponent(str).replace(/[!'()*]/g, function(v) {
      return escape(v);
    });
  } catch (e) {}
  return v;
}
