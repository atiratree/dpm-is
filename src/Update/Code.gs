/**
 * Webapp entry function, returns HTML.
 *
 * @param e url parameters setting this webapp's beahviour
 * @return {Object} HTML page with javascript
 */
function doGet(e) {
  try {
    var opts = {
      instance: e.parameter.instance,
      name: e.parameter.name,
      email: e.parameter.email,
      shortcut: e.parameter.shortcut,
    };

    switch (opts.instance) {
      case 'user':
        opts.updateObj = Utils.findEmployees([], {
          email: e.parameter.email
        })[0];
        break;
      case 'client':
        opts.updateObj = Utils.findClients(['name', 'email'], {
          name: e.parameter.name
        })[0];
        break;
      case 'tariff':
        opts.updateObj =  Utils.findTariffs([], {
          shortcut: e.parameter.shortcut
        })[0];
        break;
      default:
        return createPresentableHTML('<p>Authorizace...OK</p>', 'string');
        break;
    }

    return createPresentableHTML('main', 'file', 'Editace', opts);
  } catch (error) {
    Utils.logError('[update] ' + JSON.stringify(error));
    return createPresentableHTML('<p>SERVER_ERROR</p>', 'string');

  }
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
    switch (opts.instance) {
      case 'user':
        return processUserObj(formObject, opts);
      case 'client':
        return processClientObj(formObject, opts);
      case 'tariff':
        return processTariffObj(formObject, opts);
      default:
        return null;
    }
  } catch (error) {
    Utils.logError(error);
    return {
      fail: 'fail'
    }
  }
}
