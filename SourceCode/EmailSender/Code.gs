/**
 * Serves HTML
 *
 * @param e url parameters setting this webapp's beahviour
 * @return HTML page with javascript
 */
function doGet(e) {
  var html;
  try {
    setRuntimeProperties(e.parameter);  
    
    if (e.parameter.year && e.parameter.week && e.parameter.sheetId) {
      if (!Utils.hasAccessTo(Utils.AccessEnums.EMAIL_SENDER, Utils.PermissionTypes.VIEW)) {
        html = createPresentableHTML('<p>NO_PERMISSION</p>', 'string');
      }else{
        initialize();
        html = createPresentableHTML('main', 'file', 'Výběr emailů');
      }
    } else {
      html = createPresentableHTML('<p>Authorizace...OK</p>', 'string');
    }
  } catch (error) {
    Utils.logError('[sheets redirect] ' + JSON.stringify(error));
    html = createPresentableHTML('<p>Server je zaneprázdněn (mohlo dojít k dosáhnutí limitu u Google služby). Chvíly počkejte a zkuste znovu.</p>', 'string');    
  } 
  
  return html;
}


/**
 *  Init clients array to manager
 *
 */
function initialize(){
  var map = {}; //getProp('group')
  var clients = Utils.findClients([], {}, 'Tým B').filter(function(item){
    return item.email != null && item.email != '';    
  });
  
  clients = Utils.sort(clients, 'name');
  
  clients.forEach(function(item){   
    var key = item.email;
    var value = item.name;
    
    if(map[key]){
      map[key].names.push(value);      
    }else{
      map[key] = {names: [value]};
    }
  }); 
  
  manager.ss = SpreadsheetApp.openById(getProp('sheetId'));
  manager.clients = map; 
}

/**
 * Processes form and returns result.
 *
 * @param formObject Form object
 * @return object which designates success or failure
 */
function processForm(formObject) {
  try {
    switch (getProp('type')) {
      case 'client':
        return processClients(formObject);
      default:
        return null;
    }
  } catch (error) {
    Utils.logError(error);
    return {
      fail: 'fail',
      message: error.message
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

/**
 * Evaluates GAS scriptlets and includes HMTL from a file. *just shortcut a for a long command
 *
 * @param filename name of file to be included
 * @return string of result html
 */
function includeAndEvaluate(filename) {
  return HtmlService.createTemplateFromFile(filename).evaluate().getContent();
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
