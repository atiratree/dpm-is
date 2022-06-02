/**
 * Logs message to Log SpreadSheet
 *
 * @param msg message to be logged
 */

function log(msg) {
  try {
    logToSheet_(msg,  openSpreadsheet(getUtilsProp_('LogSSid')).getSheetByName('log'), false, manager.logSize);
  } catch (x) {}
}

/**
 * Logs error to Log SpreadSheet
 *
 * @param msg message to be logged
 */
function logError(msg) {
  try {
    logToSheet_(msg, openSpreadsheet(getUtilsProp_('ErrorSSid')).getSheetByName('errors'), false, manager.errorsLogSize);
  } catch (x) {}
}

/**
 * Logs correction to Log SpreadSheet
 *
 * @param msg message to be logged
 */
function logCorrection(msg) {
  try {
    logToSheet_(msg,  openSpreadsheet(getUtilsProp_('LogSSid')).getSheetByName('corrections'), false, manager.correctionsLogSize);
  } catch (x) {}
}

/**
 * Appends message to Log SpreadSheet
 *
 * @param e message to be logged
 * @param sheet sheet to be logged into
 * @param debug if true turns debugging options which shows formatted exceptions
 * @param logSize maximum allowed size of the sheet (should be larger than 10)
 */
function logToSheet_(e, sheet, debug, logSize) {
  let message = '';
  let user = "Undefined"
  let scriptName = "Undefined"

  if (typeof e == 'string' || e instanceof String) {
    message = e;
  } else {
    if (e && e.stack) {
      if (debug) {
        logToSheet_(e.name + ' in line ' + e.lineNumber + ': ' + e.message, sheet);
        logToSheet_(e.stack.match(/\([^\)]*\)/g).reverse().join(' > ').replace(/[\(\)]/g, ''), sheet);
      }
      message = e.toString();
    } else {
      message = JSON.stringify(e);
    }
  }

  try {
    user = getUserEmail()
  } catch(ignored) {
  }

  try {
    const scriptID = ScriptApp.getScriptId();
    scriptName = DriveApp.getFileById(scriptID).getName();
  } catch(ignored) {
  }

  const date = new Date().toString().replace(/(.*\d{2}:\d{2}:\d{2}).*/, '$1')

  const value = '[' + date + '] [' + user +  '] [' + scriptName + ']  ' + message;

  rollLog_(sheet, logSize);
  sheet.appendRow([value]);
}

/**
 * rolling appender, rolls only last 10 percent for effectivity reasons
 * @param logSheet which sheet to log to (defaults to errors sheet in Errors spreadsheet)
 * @param logSize maximum allowed size of the sheet (should be larger than 10)
 */
function rollLog_(logSheet, logSize) {
  const sheet = logSheet ? logSheet : openSpreadsheet(getUtilsProp_('ErrorSSid')).getSheetByName('errors');
  const size = logSize > 10 ? logSize : manager.logSize;

  if (sheet.getLastRow() > size) {
    const range = sheet.getRange(1, 1, size);
    const range2 = sheet.getRange(size > 10 ? Math.ceil(size / 10) : 2, 1, size); // has to be larger than 10
    range2.moveTo(range);
  }
}
