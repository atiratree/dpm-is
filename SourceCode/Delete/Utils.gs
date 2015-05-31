/**
 * Helper function to create main HTML. It can return html, javascript or string we need, to include in page.
 *
 * @param resource string describing wanted resource 
 * @return requested resource or null if resource not found
 */
function getResource(resource) {
  switch (getProp('instance')) {
    case 'client':
      switch (resource) {
        case 'deleteButton':
          return 'Smazat Klienta';
        case 'deleteMessage':
          return 'Opravdu si přejete smazat klienta : ' + getProp('name') + '?';
        case 'accessError':
          return 'Nemáte právo  smazat tohoto klienta.';
        case 'successMessage':
          return 'Klient ' + getProp('name') + ' byl úspěšně smazán.';
        case 'failDelete':
          return 'Klient byl již smazán';
        default:
          return null;
      }
    case 'event':
      switch (resource) {
        case 'deleteButton':
          return 'Smazat Událost';
        case 'deleteMessage':
          return 'Opravdu si přejete smazat událost : ' + getProp('name') + '?';
        case 'accessError':
          return 'Nemáte právo  smazat tuto událost.';
        case 'successMessage':
          return 'Událost ' + getProp('name') + ' byla úspěšně smazána.';
        case 'failDelete':
          return 'Událost byla již smazána';
        default:
          return null;
      }
    case 'user':
      switch (resource) {
        case 'deleteButton':
          return 'Smazat Uživatele';
        case 'deleteMessage':
          return 'Opravdu si přejete smazat uživatele : ' + getProp('name') + '(' + getProp('nick') + ', ' + getProp('email') + ')?';
        default:
          return null;
      }
    case 'tariff':
      switch (resource) {
        case 'deleteButton':
          return 'Smazat Cenové pásmo';
        case 'deleteMessage':
          return 'Opravdu si přejete smazat cenové pásmo : ' + getProp('shortcut') + '?';
        default:
          return null;
      }
    case 'group':
      switch (resource) {
        case 'deleteButton':
          return 'Smazat Skupinu';
        case 'deleteMessage':
          return 'Opravdu si přejete smazat skupinu : ' + getProp('name') + '?';
        default:
          return null;
      }
    default:
      switch (resource) {
        case 'deleteMessage':
          return 'Script nepovoluje smazání této instance';
        default:
          return null;
      }
  }
}

/**
 * Includes HMTL from a file. *just shortcut a for a long command
 *
 * @param filename name of file to be included
 * @return string of html
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/*
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
 *
 * @return true if we are editing user
 */
function hasSitesPermission() {
  return getProp('instance') === 'user';
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
var propItems = ['instance', 'email', 'name', 'shortcut', 'nick'];
var sessionId = 'delete';  
