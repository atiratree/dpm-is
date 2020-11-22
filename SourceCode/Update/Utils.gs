/**
 * Helper function to create main HTML. It can return html, javascript or string we need, to include in our page.
 *
 * @param resource string describing wanted resource
 * @param {Object} opts received URL params and loaded data
 * @return {Object} requested resource or null if resource not found
 */
function getResource(resource, opts) {
  switch (opts.instance) {
    case 'user':
      switch (resource) {
        case 'form':
          return includeAndEvaluate('user-form', opts);
        case 'dependentJS':
          return include('user-js');
        default:
          return null;
      }
    case 'client':
      switch (resource) {
        case 'form':
          return includeAndEvaluate('client-form', opts);
        case 'dependentJS':
          return include('client-js');
        default:
          return null;
      }
    case 'tariff':
      switch (resource) {
        case 'form':
          return includeAndEvaluate('tariff-form', opts);
        default:
          return null;
      }
    default:
      return null;
  }
}

/**
 * Evaluates GAS scriptlets and includes HMTL from a file. *just shortcut a for a long command
 *
 * @param filename name of file to be included
 * @return {string} string of result html
 */
function includeAndEvaluate(filename, opts) {
  return createPresentableHTML(filename,  'file', '', opts).getContent();
}

/**
 * Includes HMTL from a file. *just shortcut a for a long command
 *
 * @param filename name of file to be included
 * @return {string} string of html
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
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
      .setTitle(title);
  }

  var html = HtmlService.createTemplateFromFile(content);

  if(properties){
    Object.keys(properties).forEach(function(key){
      html[key] = properties[key];
    });
  }

  return html.evaluate()
      .setTitle(title);
}
