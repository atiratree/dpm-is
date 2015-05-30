/**
 * Helper function to create main HTML. It can return html, javascript or string we need, to include in our page.
 *
 * @param resource string describing wanted resource 
 * @return requested resource or null if resource not found
 */
function getResource(resource) {
  switch (getProp('instance')) {
    case 'user':
      switch (resource) {
        case 'form':
          return includeAndEvaluate('user-form');
        case 'dependentJS':
          return include('user-js');
        default:
          return null;
      }
    case 'client':
      switch (resource) {
        case 'form':
          return includeAndEvaluate('client-form');
        case 'dependentJS':
          return include('client-js');
        default:
          return null;
      }
    case 'tariff':
      switch (resource) {
        case 'form':
          return includeAndEvaluate('tariff-form');
        default:
          return null;
      }
    default:
      return null;
  }
}

/*
 * Evaluates GAS scriptlets and includes HMTL from a file. *just shortcut a for a long command
 *
 * @param filename name of file to be included
 * @return string of result html
 */
function includeAndEvaluate(filename) {
  return HtmlService.createTemplateFromFile(filename).evaluate().getContent();
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
 * Wrapper function. 
 */
function saveData(fieldName, obj) {
  Utils.setUserObjProp(fieldName, obj);
}

/**
 * Wrapper function.
 */
function getData(fieldName) {
  return Utils.getUserObjProp(fieldName);
}

/**
 * Wrapper function.
 */
function getProp(name) {
  return Utils.getUserProp(name);
}
