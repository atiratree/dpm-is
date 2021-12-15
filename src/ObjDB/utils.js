function logException_(e) {
  var errSheet = SpreadsheetApp.openById('1DBFMQfLfXl1aWIotXDcGvRJZAVP8DJeOMwiTvdkm5Ko').getSheetByName('errors');
  var user = "null"
  var scriptName = "null"

  try {
    user = Session.getActiveUser().getEmail();
  } catch(ignored) {
  }

  try {
    var scriptID = ScriptApp.getScriptId();
    scriptName = DriveApp.getFileById(scriptID).getName();
  } catch(ignored) {
  }


  logMessage_(errSheet, user, scriptName, e.name + ' in line ' + e.lineNumber + ': ' + e.message);
  logMessage_(errSheet, user, scriptName, e.stack.match(/\([^\)]*\)/g).reverse().join(' > ').replace(/[\(\)]/g, ''));
}

function logMessage_(sheet, user, scriptName, message) {
  var date = new Date().toString().replace(/(.*\d{2}:\d{2}:\d{2}).*/, '$1')
  var value = '[' + date + '] [' + user +  '] [' + scriptName + ']  ' + message;
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
