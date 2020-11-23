/**
 * Webapp entry function, returns HTML.
 *
 * @param e url parameters setting this webapp's beahviour
 * @return {Object} HTML page with javascript
 */
function doGet(e) {
  var html;
  try {
    if (e.parameter.instance) {
      html = createPresentableHTML('main', 'file', 'Smazání', {
        instance: e.parameter.instance,
        name: e.parameter.name,
        email: e.parameter.email,
        shortcut: e.parameter.shortcut,
        nick: e.parameter.nick
      } );
    } else {
      html = createPresentableHTML('<p>Authorizace...OK</p>', 'string');
    }
  } catch (error) {
    html = createPresentableHTML('<p>SERVER_ERROR</p>', 'string');
    Utils.logError('[delete] ' + error);
  }
  return html;
}

/**
 * Calls delete for object of this instance
 *
 * @param {Object} opts received URL params
 * @return {Object} object which designates success or failure
 */
function del(opts) {
  try {
    switch (opts.instance) {
      case 'client':
        return deleteClient(opts);
      case 'event':
        return deleteEvent(opts);
      case 'user':
        return deleteUser(opts);
      case 'tariff':
        return deleteTariff(opts)
      case 'group':
        return deleteGroup(opts)
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
