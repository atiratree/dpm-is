function logException_(e) {
  var errSheet = SpreadsheetApp.openById('1DBFMQfLfXl1aWIotXDcGvRJZAVP8DJeOMwiTvdkm5Ko').getSheetByName('errors');
  logMessage_(errSheet, e.name + ' in line ' + e.lineNumber + ': ' + e.message);
  logMessage_(errSheet, e.stack.match(/\([^\)]*\)/g).reverse().join(' > ').replace(/[\(\)]/g, ''));
}

function logMessage_(sheet, message) {
  var value = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1") + " : " + message;
  sheet.appendRow([value]);
}

/**
 * Webapp entry function, returns HTML.
 *
 * @param e url parameters setting this webapp's beahviour
 * @return {Object} HTML page with javascript
 */
function doGet(e) {
  return HtmlService.createTemplate('<p>Authorizace...OK</p>').evaluate();
}
