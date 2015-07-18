
/**
 * Wrapper function.
 */
function getProp(prop) {
  return Utils.getUserProp(prop  + sessionId);
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

/* props settings variables*/
var propItems = ['type', 'year', 'week', 'sheetId', 'group'];
var sessionId = 'emailSender_' + Utils.getUserEmail(); 

var manager = {
  ss: null,
  clients: {}
}