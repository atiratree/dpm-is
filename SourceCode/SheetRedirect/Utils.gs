/**
 * Helper function to create main HTML. It can return html, string or arrays of objects we need to include in our page.
 *
 * @param resource string describing wanted resource 
 * @param param object as {files: [..], group: [..]} with objects for faster execution
 * @return requested resource or null if resource not found
 */
function getResource(resource, param) {
  switch (getProp('sheetsRedirectPart')) {
    case 'isInGroups':
      switch (resource) {
        case 'includeBool':
          var email = Utils.getUserEmail();
          var actors = Utils.findGroupActors([], {
            employeeEmail: email
          });
          return setAndLook(email, actors, 'shRFRes')
        case 'name':
          return 'Náležíte do těchto skupin : ';
        case 'getGroups':
          return getData('shRFRes');
        case 'links':
          return getLinks(param.files, param.group, Utils.getUserEmail());
        default:
          return null;
      }
    case 'leadsGroups':
      switch (resource) {
        case 'includeBool':
          var email = Utils.getUserEmail();
          var leaders = Utils.findGroupLeaders([], {
            employeeEmail: email
          });
          return setAndLook(email, leaders, 'shRFRes2')
        case 'name':
          return 'Vedete tyto skupiny : ';
        case 'getGroups':
          return getData('shRFRes2');
        case 'links':
          return getLinks(param.files, param.group);
        default:
          return null;
      }
    case 'admin':
      switch (resource) {
        case 'includeBool':
          return Utils.getUserPermission() == 0;
        case 'name':
          return 'Všechny skupiny : ';
        case 'getGroups':
          return Utils.findGroupsAsArray();
        case 'links':
          return getLinks(param.files, param.group);
        default:
          return null;
      }
    default:
      return null;
  }
}

/**
 * Function for telling if the user can see this part of html, it is called from scriptlet.
 * Sets array to user properties.
 *
 * @param email email of active user
 * @param array array of groups this user belongs to
 * @param prop id for setting user properties, should be unique
 * @return boolean if user found in array of groups
 */
function setAndLook(email, array, prop) {
  var emails = Utils.convertObjectsToArrayByProperty(array, 'employeeEmail');
  var groups = Utils.convertObjectsToArrayByProperty(array, 'group');

  saveData(prop, groups);

  return emails.indexOf(email) > -1;
}

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
function saveData(fieldName, obj, ss) {
  var token = ss == null ? '' : ss.getId();
  Utils.setUserObjProp(token + fieldName + sessionId, obj);
}

/**
 * Wrapper function for getting data associated it with this spreadsheet 
 */
function getData(fieldName, ss) {
  var token = ss == null ? '' : ss.getId();
  return Utils.getUserObjProp(token + fieldName + sessionId);
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
     renewProps[prop] = value;
  });
  Utils.setUserProps(renewProps);
}
 
/* props settings variables*/
var propItems = ['year', 'week', 'sheetsRedirectPart', 'colors', 'nicks', 'actors', 'clientsNames', 'clientsSpecial', 'defaultTariff', 'sheetsRedirectFiles', 'shRFRes', 'shRFRes2'];
var sessionId = 'sheetsRedirect';  

