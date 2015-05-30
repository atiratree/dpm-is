/**
 * Helper function to create main HTML. It can return html, javascript or string we need, to include in our page.
 *
 * @param resource string describing wanted resource 
 * @return requested resource or null if resource not found
 */
function getResource(resource) {
  switch (manager.pageName) {
    case 'pridat-klienta':
      switch (resource) {
        case 'nextActionString':
          return 'Přidej dalšího klienta';
        case 'form':
          return include('client-form');
        case 'dependentJS':
          return include('client-js');
        default:
          return null;
      }
    case 'pridat-udalost':
      switch (resource) {
        case 'nextActionString':
          return 'Přidej další událost';
        case 'form':
          return include('event-form');
        default:
          return null;
      }
    case 'pridat-uzivatele':
      switch (resource) {
        case 'nextActionString':
          return 'Přidej dalšího uživatele';
        case 'form':
          return include('user-form');
        case 'dependentJS':
          return include('user-js');
        default:
          return null;
      }
    case 'pridat-pasmo':
      switch (resource) {
        case 'nextActionString':
          return 'Přidej další pásmo';
        case 'form':
          return include('tariff-form');
        default:
          return null;
      }
    case 'pridat-skupinu':
      switch (resource) {
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
 * It is not possible to use url parameters aproach so we identify script by pageName. Bug - (https://code.google.com/p/google-apps-script-issues/issues/detail?id=535)
 *
 * @return name of Page in Sites or null if no active Sites found
 */
// 
function getPageName() {
  var pg = SitesApp.getActivePage();
  if (pg !== null) {
    return pg.getName();
  } else {
    return null
  }
}

// saves page name so we don't have to call gerPageName() all over again
var manager = {
  pageName: getPageName()
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
function findAllGroups(user) {
  return Utils.getMyGroupsWithEditAtrs();
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
