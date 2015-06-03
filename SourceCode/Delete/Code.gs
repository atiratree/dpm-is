/**
 * Webapp entry function, returns HTML.
 *
 * @param e url parameters setting this webapp's beahviour
 * @return HTML page with javascript
 */
function doGet(e) {
  var html;
  try {
    setRuntimeProperties(e.parameter);
    
    if (e.parameter.instance) {
      html = createPresentableHTML('main', 'file', 'Smazání');
    }else{
      html = createPresentableHTML('<p>Authorizace...OK</p>', 'string');
    }   
  } catch (error) {
    html = createPresentableHTML('<p>SERVER_ERROR</p>', 'string');
    Utils.logError('[delete] ' + JSON.stringify(error));
  }
  return html;
}

/**
 * Calls delete for object of this instance  
 *
 * @return object which designates success or failure
 */
function del() {
  try {
    switch (getProp('instance')) {
      case 'client':
        return deleteClient();
      case 'event':
        return deleteEvent();
      case 'user':
        return deleteUser();
      case 'tariff':
        return deleteTariff()
      case 'group':
        return deleteGroup()
      default:
        return {
          err: 'Script nepovoluje smazání této instance'
        };;
    }
  } catch (error) {
    Utils.logError(error);
    return {
      err: 'Chyba na serveru : zkuste znovu'
    };
  }
}
