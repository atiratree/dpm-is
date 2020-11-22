/**
 * Serves HTML and checks user's permission to view it
 *
 * @param e url parameters setting this webapp's beahviour
 * @return {Object} HTML page with javascript
 */
function doGet(e) {
  var html;

  try {
    if (!e.parameter.instance) {
      html = createPresentableHTML('<p>Authorizace...OK</p>', 'string');
    } else if (Utils.getUserPermission() == 0 || Utils.getUserPermission() == 1 || Utils.getUserPermission() == 2) {
      html = createPresentableHTML('main', 'file', 'Generování statistiky');
    } else {
      html = createPresentableHTML('<p>NO_PERMISSION</p>', 'string');
    }
  } catch (error) {
    html = createPresentableHTML('<p>SERVER_ERROR</p>', 'string');
    Utils.logError('[stats] ' + error);
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
    return process(formObject);
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
