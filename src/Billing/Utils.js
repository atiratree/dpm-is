/**
 * Converts duration into time format string
 *
 * @duration miliseconds
 * @return {string} duration in format h:mm:ss:SSS
 */
function msToTime(duration) {
  var miliseconds = parseInt(duration % 1000);
  var seconds = parseInt((duration / 1000) % 60);
  var minutes = parseInt((duration / (1000 * 60)) % 60);
  var hours = parseInt((duration / (1000 * 60 * 60)));

  //hours = (hours < 10) ? '0' + hours : hours;
  minutes = (minutes < 10) ? '0' + minutes : minutes;
  seconds = (seconds < 10) ? '0' + seconds : seconds;

  return hours + ':' + minutes + ':' + seconds + '.' + miliseconds;
}

/**
 * Rounds to two places, "banking format"
 *
 * @num number
 * @return {number} number with two places decimal
 */
function roundToTwo(num) {
  return (+(Math.round(num + 'e+2') + 'e-2')).toFixed(2);
}

/**
 * Generates HMTL from a file. *just shortcut a for a long command
 *
 * @param filename name of file to be included
 * @return {string} html
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * @return {Array<Object>} array with name of all clients
 */
function getClients() {
  // Find existing clients.
  const clients = Utils.convertObjectsToArrayByProperty(Utils.findClients(['name']), 'name')
  // Find deleted clients that have been in a group before. So we can obtain Billing retroactively.
  const clientsWithAGroup = Utils.convertObjectsToArrayByProperty(Utils.findGroupClients(['name'],{}), 'name');
  return Utils.sort(Utils.toUniquePrimitiveArray([...clients,...clientsWithAGroup]));
}

/**
 * Creates presentable HTML for a browser
 * *cannot be run from library, becaouse of filename
 *
 * @param content depends on a sourceType, if sourceType isn't string, it includes file with name == content
 * @param sourceType is string indicating values 'string'/'file' for source type, takes file as default for any other value
 * @param title title of a window
 * @return {string} string of html
 */
function createPresentableHTML(content, sourceType, title) {
  if (title == null) {
    title = '';
  }

  if (sourceType === 'string') {
    return HtmlService.createTemplate(content).evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).setTitle(title);
  }

  return HtmlService.createTemplateFromFile(content).evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).setTitle(title);
}
