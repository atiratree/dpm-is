/**
 * Serves HTML
 *
 * @param e url parameters setting this webapp's beahviour
 * @return {Object} HTML page with javascript
 */
 function doGet(e) {
  try {
    if (e.parameter.year && e.parameter.week) {
      try {
        Utils.getUserPermission()
      } catch (err) {
        Utils.logError('[sheets redirect] ' + JSON.stringify(err));
        return createPresentableHTML('<p>Nemáte patřičné oprávnění pro zobrazení této stránky.</p>', 'string');
      }
      return createPresentableHTML('redirect', 'file', 'Výběr rozpisu', {
        year: e.parameter.year,
        week: e.parameter.week
      } );
    }
  } catch (err) {
    Utils.logError('[sheets redirect] ' + JSON.stringify(err));
    return createPresentableHTML('<p>Server je zaneprázdněn (mohlo dojít k dosáhnutí limitu u Google služby). Chvíly počkejte a zkuste znovu.</p>', 'string');
  }
  return createPresentableHTML('<p>Authorizace...OK</p>', 'string');
}

/**
 * Includes HMTL from a file. *just shortcut a for a long command
 *
 * @param filename name of file to be included
 * @return {string} string of html
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .getContent();
}

var output = HtmlService.createHtmlOutput('<b>Hello, world!</b>');


/**
 * Evaluates GAS scriptlets and includes HMTL from a file. *just shortcut a for a long command
 *
 * @param filename name of file to be included
 * @return {string} string of result html
 */
function includeAndEvaluate(filename) {
  return HtmlService.createTemplateFromFile(filename)
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .getContent();
}

/**
 * Creates presentable HTML for a browser
 * *cannot be run from library, becaouse of filename
 *
 * @param content depends on a sourceType, if sourceType isn't string, it includes file with name == content
 * @param sourceType is string indicating values 'string'/'file' for source type, takes file as default for any other value
 * @param title title of a window
 * @param properties to be stored in metatags
 * @return {Object} html object
 */
function createPresentableHTML(content, sourceType, title, properties) {
  if (title == null) {
    title = '';
  }

  if (sourceType === 'string') {
    return HtmlService.createTemplate(content)
      .evaluate()
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .setTitle(title);
  }

  var html = HtmlService.createTemplateFromFile(content);

  if(properties){
    Object.keys(properties).forEach(function(key){
      html[key] = properties[key];
    });
  }

  return html.evaluate()
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .setTitle(title);
}
