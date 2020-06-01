var allowedInstances = ['clients', 'events', 'employees', 'tarrifs', 'groups'];
var allowedPages = ['sprava-klientu', 'sprava-udalosti', 'sprava-uzivatelu', 'sprava-cenovych-pasem', 'sprava-skupin'];

var getInstance = function(e) {
  var instance = e.parameter.instance;
  if (instance) {
    return allowedInstances.indexOf(instance) >= 0 ? instance : '';
  }
  var activePage = SitesApp.getActivePage();
  var activePageName = activePage && activePage.getName();
  var pageIdx = allowedPages.indexOf(activePageName);
  return pageIdx >= 0 ? allowedInstances[pageIdx] : '';
}

function doGet(e) {
  var instance = getInstance(e)

  if (!instance) {
    return createPresentableHTML('<p>Authorizace...OK</p>', 'string');
  }

  try {
    return createPresentableHTML('main', 'file', getResource(instance, 'title'), { instance: instance });
  } catch (e) {
    Utils.logError(e);
  }
}
