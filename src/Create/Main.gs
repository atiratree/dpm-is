/**
 * Serves HTML according to the Sites page it is embedded in.
 *
 * @return HTML page with javascript
 */
function doGet() {
  var html;
  try {
    html = resolvePermissionAndGetHTML();
  } catch (error) {
    Utils.logError('[create] ' + JSON.stringify(error));
    html = createPresentableHTML('<p>SERVER_ERROR</p>', 'string');
  }
  return html;
}

/**
 * Checks access rights for page we are serving and denies access accordingly.
 *
 * @return html page with javascript
 */
function resolvePermissionAndGetHTML() {
  switch (manager.pageName) {
    case 'pridat-klienta':
      if (!Utils.hasAccessTo(Utils.AccessEnums.CLIENT, Utils.PermissionTypes.EDIT)) {
        return getNoPermissionHTML_();
      }
      break;
    case 'pridat-udalost':
      if (!Utils.hasAccessTo(Utils.AccessEnums.EVENT, Utils.PermissionTypes.EDIT)) {
        return getNoPermissionHTML_();
      }
      break;
    case 'pridat-uzivatele':
      if (!Utils.hasAccessToSomeOf([Utils.AccessEnums.ADMIN, Utils.AccessEnums.LEADER, Utils.AccessEnums.ADMINISTRATIVE, Utils.AccessEnums.ASSISTANT], Utils.PermissionTypes
          .EDIT)) {
        return getNoPermissionHTML_();
      }
      break;
    case 'pridat-pasmo':
      if (!Utils.hasAccessTo(Utils.AccessEnums.TARIFF, Utils.PermissionTypes.EDIT)) {
        return getNoPermissionHTML_();
      }
      break;
    case 'pridat-skupinu':
      if (!Utils.hasAccessTo(Utils.AccessEnums.GROUP, Utils.PermissionTypes.EDIT)) {
        return getNoPermissionHTML_();
      }
      break;
    default:
      return createPresentableHTML('<p>Authorizace...OK</p>', 'string');
      break;
  }
  return createPresentableHTML('main', 'file', 'Správa dat: přidání');
}

/**
 *
 * @return html page with NO PERMISSION message
 */
function getNoPermissionHTML_() {
  return createPresentableHTML('<p>NO_PERMISSION</p>', 'string');
}

/**
 * Processes form and returns result.
 *
 * @param formObject Form object
 * @return object which designates success or failure
 */
function processForm(formObject) {
  try {
    switch (manager.pageName) {
      case 'pridat-klienta':
        return processClientObj(formObject);
      case 'pridat-udalost':
        return processEventObj(formObject);
      case 'pridat-uzivatele':
        return processUserObj(formObject);
      case 'pridat-pasmo':
        return processTariffObj(formObject);
      case 'pridat-skupinu':
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