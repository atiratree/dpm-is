/**
 * Helper function to create main HTML. It can return html, javascript or string we need, to include in page.
 *
 * @param resource string describing wanted resource
 * @param {Object} opts received URL params
 * @return {Object} requested resource or null if resource not found
 */
function getResource(resource, opts) {
  switch (opts.instance){
    case 'client':
      switch (resource) {
        case 'deleteButton':
          return 'Smazat Klienta';
        case 'deleteMessage':
          return 'Opravdu si přejete smazat klienta : ' + opts.name + '?';
        case 'accessError':
          return 'Nemáte právo  smazat tohoto klienta.';
        case 'successMessage':
          return 'Klient ' + opts.name + ' byl úspěšně smazán.';
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
          return 'Opravdu si přejete smazat událost : ' + opts.name + '?';
        case 'accessError':
          return 'Nemáte právo  smazat tuto událost.';
        case 'successMessage':
          return 'Událost ' + opts.name + ' byla úspěšně smazána.';
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
          return 'Opravdu si přejete smazat uživatele : ' + opts.name + '(' +  opts.nick + ', ' + opts.email + ')?';
        default:
          return null;
      }
    case 'tariff':
      switch (resource) {
        case 'deleteButton':
          return 'Smazat Cenové pásmo';
        case 'deleteMessage':
          return 'Opravdu si přejete smazat cenové pásmo : ' + opts.shortcut + '?';
        default:
          return null;
      }
    case 'group':
      switch (resource) {
        case 'deleteButton':
          return 'Smazat Skupinu';
        case 'deleteMessage':
          return 'Opravdu si přejete smazat skupinu : ' + opts.name + '?';
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
