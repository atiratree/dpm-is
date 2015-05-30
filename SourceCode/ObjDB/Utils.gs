var manager_ = {
  errSheet: SpreadsheetApp.openById('1LvOpxVTLmFBazb4QDOi-0udo4vHGm4JSJTw5yn4OKDw').getSheetByName('errors')
}

function logException_(e) {
  logMessage_(e.name + ' in line ' + e.lineNumber + ': ' + e.message);
  logMessage_(e.stack.match(/\([^\)]*\)/g).reverse().join(' > ').replace(/[\(\)]/g, ''));
}

function logMessage_(message) {
  var value = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1") + " : " + message;
  clearLog_();
  manager_.errSheet.appendRow([value]);
}

function clearLog_() {
  var errorSheet = manager_.errSheet;
  if (errorSheet.getLastRow() > 29) {
    var range = errorSheet.getRange(1, 1, 29);
    var range2 = errorSheet.getRange(2, 1, 29);
    range2.moveTo(range);
  }
}
