/**
 * Helper function to create main HTML. It can return html, javascript or string we need, to include in our page.
 *
 * @param resource string describing wanted resource
 * @param instance
 * @return requested resource or null if resource not found
 */
function getResource(instance, resource) {
  switch (instance) {
    case 'client':
      switch (resource) {
        case 'title':
          return 'Přidat klienta';
        case 'nextActionString':
          return 'Přidej dalšího klienta';
        case 'form':
          return include('client-form');
        case 'dependentJS':
          return include('client-js');
        default:
          return null;
      }
    case 'event':
      switch (resource) {
        case 'title':
          return 'Přidat událost';
        case 'nextActionString':
          return 'Přidej další událost';
        case 'form':
          return include('event-form');
        default:
          return null;
      }
    case 'employee':
      switch (resource) {
        case 'title':
          return 'Přidat uživatele';
        case 'nextActionString':
          return 'Přidej dalšího uživatele';
        case 'form':
          return include('user-form');
        case 'dependentJS':
          return include('user-js');
        default:
          return null;
      }
    case 'tarrif':
      switch (resource) {
        case 'title':
          return 'Přidat pásmo';
        case 'nextActionString':
          return 'Přidej další pásmo';
        case 'form':
          return include('tariff-form');
        default:
          return null;
      }
    case 'group':
      switch (resource) {
        case 'title':
          return 'Přidat skupinu';
        case 'nextActionString':
          return 'Přidej další skupinu';
        case 'form':
          return include('group-form');
        default:
          return null;
      }
    default:
      return null;
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
 * Wrapper function.
 */
function getMyAccessRightsNames() {
  return Utils.getMyAccessRightsNames();
}

/**
 * Wrapper function.
 */
function findAllGroups() {
  return Utils.getMyGroupsWithEditAtrs();
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
