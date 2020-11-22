/**
 * Serves HTML
 *
 * @param e url parameters setting this webapp's beahviour
 * @return {Object} HTML page with javascript
 */
function doGet(e) {
  var html;
  try {
    var opts = {
      type: e.parameter.type,
      year: e.parameter.year,
      week: e.parameter.week,
      sheetId: e.parameter.sheetId,
      group: e.parameter.group,
    };

    if (opts.year && opts.week && opts.sheetId) {
      if (!Utils.hasAccessTo(Utils.AccessEnums.EMAIL_SENDER, Utils.PermissionTypes.VIEW)) {
        html = createPresentableHTML('<p>NO_PERMISSION</p>', 'string');
      }else{
        initialize(opts);
        html = createPresentableHTML('main', 'file', 'Výběr emailů', opts);
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
 * @param {Object} opts received URL params
 */
function initialize(opts){
  var map = {};
  var clients = Utils.findClients([], {}, opts.group).filter(function(item){
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

  manager.ss = SpreadsheetApp.openById(opts.sheetId);
  manager.clients = map;
}

/**
 * Processes form and returns result.
 *
 * @param formObject Form object
 * @return {Object} object which designates success or failure
 */
function processForm(formObject) {
  try {
    var opts = JSON.parse(formObject.opts);
    delete formObject.opts;
    switch (opts.type) {
      case 'client':
        return processClients(formObject, opts);
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
