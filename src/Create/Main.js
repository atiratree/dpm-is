var allowedInstances = ['client', 'event', 'employee', 'tarrif', 'group'];

var getInstance = function(e) {
  var instance = e.parameter.instance;
  if (instance) {
    return allowedInstances.indexOf(instance) >= 0 ? instance : '';
  }
  return '';
}

/**
 * Webapp entry function, returns HTML.
 *
 * @param e url parameters setting this webapp's beahviour
 * @return {Object} HTML page with javascript
 */
function doGet(e) {
  var instance = getInstance(e)
  var html;
  try {
    html = resolvePermissionAndGetHTML(instance);
  } catch (error) {
    Utils.logError('[create] ' + error);
    html = createPresentableHTML('<p>SERVER_ERROR</p>', 'string');
  }
  return html;
}

/**
 * Checks access rights for page we are serving and denies access accordingly.
 *
 * @param instance
 * @return html page with javascript
 */
function resolvePermissionAndGetHTML(instance) {
  switch (instance) {
    case 'client':
      if (!Utils.hasAccessTo(Utils.AccessEnums.CLIENT, Utils.PermissionTypes.EDIT)) {
        return getNoPermissionHTML_();
      }
      break;
    case 'event':
      if (!Utils.hasAccessTo(Utils.AccessEnums.EVENT, Utils.PermissionTypes.EDIT)) {
        return getNoPermissionHTML_();
      }
      break;
    case 'employee':
      if (!Utils.hasAccessToSomeOf([Utils.AccessEnums.ADMIN, Utils.AccessEnums.LEADER, Utils.AccessEnums.ADMINISTRATIVE, Utils.AccessEnums.ASSISTANT], Utils.PermissionTypes
          .EDIT)) {
        return getNoPermissionHTML_();
      }
      break;
    case 'tarrif':
      if (!Utils.hasAccessTo(Utils.AccessEnums.TARIFF, Utils.PermissionTypes.EDIT)) {
        return getNoPermissionHTML_();
      }
      break;
    case 'group':
      if (!Utils.hasAccessTo(Utils.AccessEnums.GROUP, Utils.PermissionTypes.EDIT)) {
        return getNoPermissionHTML_();
      }
      break;
    default:
      return createPresentableHTML('<p>Authorizace...OK</p>', 'string');
      break;
  }
  return createPresentableHTML('main', 'file', 'Správa dat: přidání', { instance: instance });
}

/**
 *
 * @return html page with NO PERMISSION message
 */
function getNoPermissionHTML_() {
  return createPresentableHTML('<p>Nemáte patřičné oprávnění pro zobrazení této stránky.</p>', 'string');
}

/**
 * Processes form and returns result.
 *
 * @param formObject Form object
 * @return object which designates success or failure
 */
function processForm(formObject) {
  try {
    var opts = JSON.parse(formObject.opts);
    delete formObject.opts;
    switch (opts.instance) {
      case 'client':
        return processClientObj(formObject);
      case 'event':
        return processEventObj(formObject);
      case 'employee':
        return processUserObj(formObject);
      case 'tarrif':
        return processTariffObj(formObject);
      case 'group':
        return processGroupObj(formObject);
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