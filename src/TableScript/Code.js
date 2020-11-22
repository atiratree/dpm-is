var allowedInstances = ['clients', 'events', 'employees', 'tarrifs', 'groups'];

var getInstance = function(e) {
  var instance = e.parameter.instance;
  if (instance) {
    return allowedInstances.indexOf(instance) >= 0 ? instance : '';
  }
  return '';
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
