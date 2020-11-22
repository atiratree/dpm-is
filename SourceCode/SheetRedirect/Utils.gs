/**
 * Gets links for group in format for scriptlets to assemble the page
 * sets array to user properties
 *
 * @param files all files this function searches in
 * @param group group we want to have links of
 * @param owner it takes all files without owner, if this parameter set, takes files with this owner too
 * @return array of links
 */
function getLinks(files, group, owner) {
  var result = [];
  for (var i = 0; i < files.length; i++) {
    if (files[i].group == group && (owner == null || files[i].owner == '' || files[i].owner == null || files[i].owner == owner)) {
      result.push(files[i]);
    }
  }
  return result;
}

/**
 * Wrapper function for saving data associated it with this spreadsheet
 */
function saveScriptData(fieldName, obj) {
  PropertiesService.getDocumentProperties().setProperty(fieldName, JSON.stringify(obj));
}

/**
 * Wrapper function for getting data associated it with this spreadsheet
 */
function getScriptData(fieldName) {
  var data = PropertiesService.getDocumentProperties().getProperty(fieldName);
  return data ? JSON.parse(data) : null;
}

/**
 * Wrapper function.
 */
function getBoolProp(prop) {
  var value = Utils.getProp(prop, userEmail);
  return !!value && (value === true || value.toLowerCase() === "true");
}

/**
 * Wrapper function.
 */
function setProp(prop, value) {
  return Utils.setProp(prop, value, userEmail);
}

/**
 * Maps obj properties to string as url parameters.
 *
 * @param obj object to convert
 * @return {string} parameter part of html
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
 * @return {string} rfc3986 URI component
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

/* props settings variables*/
var userEmail = Utils.getUserEmail();

/* Manager for storing and caching*/
var manager = {
  colors: null,
  nicks: null,
  defaultTariff: null,
  events: null,
  emailSenderScriptURL: 'https://script.google.com/a/macros/domovpromne.cz/s/AKfycbzZMQ21z3CsjzoDGMFNkUMbFFdupbjfqhQX1Cv6n1UiZkxDd1Q/exec'
}
