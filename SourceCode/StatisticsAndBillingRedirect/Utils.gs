/**
 * Helper function to create main HTML. It can return html, javascript ot strings we need to include in our page.
 *
 * @param resource string describing wanted resource 
 * @return requested resource or null if resource not found
 */
function getResource(resource) {
  switch (getProp('instance')) {
    case 'statistics':
      switch (resource) {
        case 'name':
          return 'Výpis statistik za období';
        default:
          return null;
      }
    case 'billing':
      switch (resource) {
        case 'name':
          return 'Fakturace za období';
        case 'dependentJS':
          return include('billing-js');
        default:
          return null;
      }
    default:
      return null;
  }
}

/**
 * Creates array of object properties and sortes them 
 *
 * @param obj Object with string properties 
 * @return sorted array of obj properties
 */
function getSortedObjProps(obj) {
  var keys = [];

  for (var k in obj) {
    if (obj.hasOwnProperty(k)) {
      keys.push(k);
    }
  }
  keys.sort();

  return keys;
}

/**
 * Converts duration into time format string
 *
 * @duration miliseconds
 * @return duration in format h:mm:ss:SSS
 */
function msToTime(duration) {
  var miliseconds = parseInt(duration % 1000);
  var seconds = parseInt((duration / 1000) % 60);
  var minutes = parseInt((duration / (1000 * 60)) % 60);
  var hours = parseInt((duration / (1000 * 60 * 60)));

  //hours = (hours < 10) ? '0' + hours : hours;
  minutes = (minutes < 10) ? '0' + minutes : minutes;
  seconds = (seconds < 10) ? '0' + seconds : seconds;

  return hours + ':' + minutes + ':' + seconds + '.' + miliseconds;
}

/**
 * Rounds to two places, "banking format"
 *
 * @num number
 * @return number with two places decimal
 */
function roundToTwo(num) {
  return (+(Math.round(num + 'e+2') + 'e-2')).toFixed(2);
}

/**
 * Generates HMTL from a file. *just shortcut a for a long command
 *
 * @param filename name of file to be included
 * @return html
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * @return array with name of all clients
 */
function getClients() {
  return Utils.convertObjectsToArrayByProperty(Utils.findClients(), 'name');
}

/**
 * Creates presentable HTML for a browser
 * *cannot be run from library, becaouse of filename
 *
 * @param content depends on a sourceType, if sourceType isn't string, it includes file with name == content
 * @param sourceType is string indicating values 'string'/'file' for source type, takes file as default for any other value
 * @param title title of a window
 * @return string of html
 */
function createPresentableHTML(content, sourceType, title) {
  if (title == null) {
    title = '';
  }

  if (sourceType === 'string') {
    return HtmlService.createTemplate(content).evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).setTitle(title);
  }

  return HtmlService.createTemplateFromFile(content).evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).setTitle(title);
}


/**
 * Wrapper function.
 */
function getProp(name) {
  return Utils.getUserProp(name  + sessionId);
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
 
/* props settings variables*/
var propItems = ['instance'];
var sessionId = 'statsBill';  

