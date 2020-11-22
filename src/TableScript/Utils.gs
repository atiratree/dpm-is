/**
 * Helper function to create main HTML. It can return html, javascript or string we need, to include in page.
 *
 * @param resource string describing wanted resource
 * @param instance
 * @return requested resource or null if resource not found
 */
function getResource(instance, resource) {
  switch (instance) {
    case 'clients':
      switch (resource) {
        case 'tableData':
          return getClientsTable();
        case 'title':
          return 'Správa klientů';
        default:
          return null;
      }
    case 'events':
      switch (resource) {
        case 'tableData':
          return getEventsTable();
        case 'title':
          return 'Správa událostí';
        default:
          return null;
      }
    case 'employees':
      switch (resource) {
        case 'tableData':
          return getEmployeesTable();
        case 'title':
          return 'Správa uživatelů';
        default:
          return null;
      }
    case 'tarrifs':
      switch (resource) {
        case 'tableData':
          return getTariffsTable();
        case 'title':
          return 'Správa cenových pásem';
        default:
          return null;
      }
    case 'groups':
      switch (resource) {
        case 'tableData':
          return getGroupsTable();
        case 'title':
          return 'Správa skupin';
        default:
          return null;
      }
    default:
      return null;
  }
}

function getTableData(instance){
  return {
    data: getResource(instance, "tableData"),
    title: getResource(instance, "title")
  }
}

/**
 * Maps obj properties to string as url parameters.
 *
 * @param obj object to convert
 * @return parameter part of html
 */
function constructUrlParameters(obj) {
  var value = '';

  for (var prop in obj) {
    if (value) {
      value += '&';
    } else {
      value = '?';
    }
    value += prop + '=' + rfc3986EncodeURIComponent(obj[prop]);
  }
  return value;
}

/**
 * Encodes URI component.
 *
 * @param str string to encode
 * @return rfc3986 URI component
 */
function rfc3986EncodeURIComponent(str) {
  var v = '';
  try {
    v = encodeURIComponent(str).replace(/[!'()*]/g, function(v) {
      return escape(v);
    });
  } catch (e) {}
  return v;
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
 * @return html object
 */
function createPresentableHTML(content, sourceType, title, properties) {
  if (title == null) {
    title = '';
  }

  if (sourceType === 'string') {
    return HtmlService.createTemplate(content).evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).setTitle(title);
  }

  var html = HtmlService.createTemplateFromFile(content);

  if(properties){
    Object.keys(properties).forEach(function(key){
      html[key] = properties[key];
    });
  }

  return html.evaluate()
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .setTitle(title);
}
