/**
 * Webapp entry function, returns HTML.
 *
 * @param e url parameters setting this webapp's beahviour
 * @return HTML page with javascript
 */
function doGet(e) {
  try {
    PropertiesService.getUserProperties().deleteAllProperties();
    Utils.deleteProp('userPermission');
    for (var prop in e.parameter) {
      Utils.setUserProp(prop, e.parameter[prop]);
    }

    switch (getProp('instance')) {
      case 'user':
        saveData('updateObj', Utils.findEmployees([], {
          email: e.parameter.email
        })[0]);
        break;
      case 'client':
        saveData('updateObj', Utils.findClients(['name', 'email'], {
          name: e.parameter.name
        })[0]);
        break;
      case 'tariff':
        saveData('updateObj', Utils.findTariffs([], {
          shortcut: e.parameter.shortcut
        })[0]);
        break;
      default:
        return null;
    }

    var html = createPresentableHTML('main', 'file', 'Editace');
  } catch (error) {
    Utils.logError(error);
    throw error;
  }
  return html;
}

/**
 * Processes form and returns result.
 *
 * @param formObject Form object
 * @return object which designates success or failure
 */
function processForm(formObject) {
  try {
    switch (getProp('instance')) {
      case 'user':
        return processUserObj(formObject);
      case 'client':
        return processClientObj(formObject);
      case 'tariff':
        return processTariffObj(formObject);
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
