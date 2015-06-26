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
    
    if (e.parameter.year && e.parameter.week) {
      html = createPresentableHTML('redirect', 'file', 'Výběr rozpisu');
    } else {
      html = createPresentableHTML('<p>Authorizace...OK</p>', 'string');
    }
  } catch (error) {
    if(checkIfPropsFull()){ // pri opakovani F5 dosáhne přístup do properties max limitu
      Utils.logError('[sheets redirect] ' + JSON.stringify(error));
      html = createPresentableHTML('<p>Nelze zobrazit rozpisy. 1) Server může být zaneprázdněn, zkuste znovu. 2) Nebo nenáležíte do žádné skupiny</p>', 'string');
    }else{
       html = createPresentableHTML('<p>Server je zaneprázdněn (mohlo dojít k dosáhnutí limitu u Google služby). Chvíly počkejte a zkuste znovu.</p>', 'string');
    }    
  } 
  return html;
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
