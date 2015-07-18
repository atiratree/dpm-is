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
function getProp(prop) {
  return Utils.getUserProp(prop  + sessionId);
}

/**
 * Wrapper function.
 */
function getParsedScriptProp(prop) {
  var obj  = PropertiesService.getScriptProperties().getProperty(prop + sessionId);
  return obj ? JSON.parse(obj) : '';
}

/**
 * Wrapper function.
 */
function setScriptProp(prop, value) {
  PropertiesService.getScriptProperties().setProperty(prop + sessionId, value);
  return Utils.getUserObjProp(prop  + sessionId);
}

/**
 * Wrapper function.
 */
function setProp(prop, value) {
  Utils.setUserProp(prop + sessionId, value);
}

/**
 * Sets runtime properties
 *
 * @param params object with properties to set
 */
function setRuntimeProperties(params){
  var renewProps = {};
  
  propItems.forEach(function(prop){
     var value = (params && params[prop] != null) ? params[prop] : '';     
     renewProps[prop + sessionId] = value;
     
  });
  Utils.setUserProps(renewProps);
}

/**
 * Checks if props are set corectly
 *
 * @return true if props are correctly set, false otherwise
 */
function checkIfPropsFull(){
  var result = true;
  
  for(var item in propItems){
    if(!getProp(item)){
      result = false;
      break;
    }
  }
  
  return result;
}


// log all users except admin, for debugging purposes
function temporaryTestingLog(email, message){
  email = email ? email : Utils.getUserEmail();
  var value =  PropertiesService.getScriptProperties().getProperty('testLog');
  
  if(Utils.isSuperAdmin(email)){
    Utils.log('\n' + value);
  }else{
    var msg = '[' + new Date().toString().replace(/(.*\d{2}:\d{2}:\d{2}).*/, '$1') + '] [' + email + ']  week: ' + message + '\n';
    value = value ? value + msg : msg;
    PropertiesService.getScriptProperties().setProperty('testLog', value);
  }  
}
 

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
 
/* props settings variables*/
var propItems = ['year', 'week'];
var sessionId = 'sheetsRedirect_' + Utils.getUserEmail(); 

/* Manager for storing and caching*/
var manager = { 
  colors: null,
  nicks: null,
  defaultTariff: null,
  events: null,
  emailSenderScriptURL: 'https://script.google.com/a/macros/domovpromne.cz/s/AKfycbzZMQ21z3CsjzoDGMFNkUMbFFdupbjfqhQX1Cv6n1UiZkxDd1Q/exec'
}  