/**
 * Function which processes behaviour when spreadsheet is edited
 *
 * @param e event send from spreadsheet
 */
function editMainSheet (e) {
  var sheet = e.source.getActiveSheet();

  if (sheet.getName() === 'Rozpis') {

    var col = e.range.getColumn();
    var row = e.range.getRow();
    var rows = e.range.getNumRows();
    var cols = e.range.getNumColumns();

    if (rows > 5) { // don't check large quantities == slow
      return;
    }

    var layout = Utils.extractSpreadsheetData(sheet);
    if (!layout.weekday.valid && !layout.weekend.valid) {
      return;
    }

    for (var j = 0; j < rows; j++) {
      var targetRow = row + j;

      for (var i = 0; i < cols && i < 6 * 5 + 2; i++) { // we can delete more rows at once and keep formating, but we can insert only value to one cell
        var targetCol = col + i;

        if ((layout.weekday.valid && targetRow >= layout.weekday.from && targetRow <= layout.weekday.to && targetCol < 6 * 5 + 1) ||
          (layout.weekend.valid && targetRow >= layout.weekend.from && targetRow <= layout.weekend.to && targetCol < 6 * 2 + 1)) { // select our specified area
          if (((targetCol + 2) % 6 == 0)) {
            employeeChanged(sheet, targetRow, targetCol);
          }
          if (((targetCol + 3) % 6 == 0)) {
            mainEventChanged(e, sheet, targetRow, targetCol);
          }
          if (((targetCol + 4) % 6 == 0)) {
            dateChanged(sheet, targetRow, targetCol - 1);
          }
          if (((targetCol + 5) % 6 == 0)) {
            dateChanged(sheet, targetRow, targetCol);
          }
        }
      }

    }
  }
}

/**
 * Manipulates row if selected value is event or client
 *
 * @param e event send from spreadsheet
 * @param sheet sheet of event
 * @param row row of event
 * @param col col of event
 */
function mainEventChanged (e, sheet, row, col) {
  if (e.value && isSelectedMainEvent(e.value)) {
    sheet.getRange(row, col, 1, 3).setBackground('#ffffff');
    sheet.getRange(row, col + 1, 1, 2).setValue('');
  }
}

/**
 * Validates values of changed date
 *
 * @param sheet sheet of event
 * @param row row of event
 * @param col col of event
 */
function dateChanged (sheet, row, col) {
  var from = sheet.getRange(row, col, 1, 1);
  var to = sheet.getRange(row, col + 1, 1, 1);

  if (from.getValue() != '' && to.getValue() != '' && Utils.compareTimes(from.getValue(), to.getValue()) <= 0) {
    to.setValue('');
    alertUi(to.getA1Notation() + ': Od musí být menší než Do !')
  }
}

/**
 * Resolves colours and default tariff if employee selected
 *
 * @param sheet sheet of event
 * @param row row of event
 * @param col col of event
 */
function employeeChanged (sheet, row, col) {
  var background = '#ffffff';
  var values = sheet.getRange(row, col - 1, 1, 3).getValues()

  var tariff = values[0][2];
  var value = values[0][1];
  var event = values[0][0];

  if (value) {
    if (manager.colors == null)
      manager.colors = getScriptData('colors');
    if (manager.nicks == null)
      manager.nicks = getScriptData('nicks');
    if (manager.defaultTariff == null)
      manager.defaultTariff = getScriptData('defaultTariff');

    var colors = manager.colors;
    var index = manager.nicks.indexOf(value);
    var defaultTariff = manager.defaultTariff;


    if (index > -1 && colors[index]) {
      background = colors[index];
    }

    if (defaultTariff && tariff == '') {
      tariff = defaultTariff;
    }

    if (isSelectedMainEvent(event)) {
      var mainEventRange = sheet.getRange(row, col - 1);
      mainEventRange.setValue('');
    }
  }

  if (tariff != values[0][2]) {
    sheet.getRange(row, col + 1).setValue(tariff);
  }

  sheet.getRange(row, col - 1, 1, 3).setBackground(background);
}

/**
 * Checks if is main event
 *
 * @param value value of selected field
 * @return {boolean} true if selected event is not a client
 */
function isSelectedMainEvent (value) {
  if (manager.events == null) {
    manager.events = getScriptData('events');
  }
  var events = manager.events;

  return events.indexOf(value) > -1;
}
