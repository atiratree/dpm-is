/**
 * Serves HTML and checks user's permission to view it
 *
 * @param e url parameters setting this webapp's beahviour
 * @return {Object} HTML page with javascript
 */
function doGet(e) {
  var html;

  try {
    setRuntimeProperties(e.parameter);

    if (!e.parameter.instance) {
      html = createPresentableHTML('<p>Authorizace...OK</p>', 'string');
    } else if (Utils.getUserPermission() == 0 || Utils.getUserPermission() == 1 || Utils.getUserPermission() == 2) {
      html = createPresentableHTML('main', 'file', getProp('instance') == 'statistics' ? 'Generování statistiky' : 'Generování fakturace');
    } else {
      html = createPresentableHTML('<p>NO_PERMISSION</p>', 'string');
    }
  } catch (error) {
    html = createPresentableHTML('<p>SERVER_ERROR</p>', 'string');
    Utils.logError('[stats/bill] ' + JSON.stringify(error));
  }
  return html;
}

/**
 * Processes form and returns result.
 *
 * @param formObject Form object
 * @return {Object} object which designates success or failure
 */
function processForm(formObject) {
  try {
    switch (getProp('instance')) {
      case 'statistics':
        return processStatOrBillObj(formObject);
      case 'billing':
        return processStatOrBillObj(formObject, true);
      default:
        return null;
    }
  } catch (error) {
    if (error.timeout){
      return {fail: 'fail', failMessage: 'Čas na spuštění skriptu vypršel. Skuste spustit znovu pro kratší časový interval.'}
    }

    Utils.logError(error);
    return {
      fail: 'fail'
    }
  }
}
