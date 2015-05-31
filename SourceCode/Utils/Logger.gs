/**
 * Logs message to Log SpreadSheet 
 *
 * @param msg message to be logged
 */

function log(msg) {
  try {
    logToSheet_(msg, manager.logSheet);
  } catch (x) {}
}

/**
 * Logs error to Log SpreadSheet 
 *
 * @param msg message to be logged
 */
function logError(msg) {
  try {
    logToSheet_(msg, manager.errSheet);
  } catch (x) {}
}

/**
 * Appends message to Log SpreadSheet 
 *
 * @param e message to be logged
 * @param sheet sheet to be logged into
 * @param debug if true turns debugging options which shows formated exceptions
 */
function logToSheet_(e, sheet, debug) {
  var message = '';
  if (typeof e == 'string' || e instanceof String) {
    message = e;
  } else {
    if (debug && e && e.stack) {
      logToSheet_(e.name + ' in line ' + e.lineNumber + ': ' + e.message, sheet);
      logToSheet_(e.stack.match(/\([^\)]*\)/g).reverse().join(' > ').replace(/[\(\)]/g, ''), sheet);
    }
    message = JSON.stringify(e);
  }
  var value = '[' + new Date().toString().replace(/(.*\d{2}:\d{2}:\d{2}).*/, '$1') + '] [' + getUserEmail() + ']  ' + message;

  rollLog_(sheet);
  sheet.appendRow([value]);
}

/**
 * rolling appender, rolls only last 10 percent for effectivity reasons
 */
function rollLog_(logSheet) {
  var sheet = logSheet ? logSheet : manager.errSheet;
  var size = manager.logSize > 0 ? manager.logSize : 1;
  if (sheet.getLastRow() > size) {
    var range = sheet.getRange(1, 1, size);
    var range2 = sheet.getRange(size > 10 ? Math.ceil(size / 10) : 2, 1, size); // has to be larger than 10 
    range2.moveTo(range);
  }
}
