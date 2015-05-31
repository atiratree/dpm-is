/**
 * Function which processes behaviour when spreadsheet is edited
 *
 * @param e event send from spreadsheet
 */
function editMainSheet(e) {
  var sheet = e.source.getActiveSheet();

  if (sheet.getName() === 'Rozpis') {
    var col = e.range.getColumn();
    var row = e.range.getRow();
    var rows = e.range.getNumRows();
    var cols = e.range.getNumColumns();

    for (var j = 0; j < rows; j++) {
      if ((row + j > 4 && row + j < 33) || (row + j > 36 && row + j < 57)) // select our specified area
        for (var i = 0; i < cols; i++) { // we can delete more rows at once and keep formating, but we can insert only value to one cell
        if (((col + i + 2) % 6 == 0)) {
          employeeChanged(e, sheet, col + i, row + j);
        }
        if (((col + i + 3) % 6 == 0)) {
          mainEventChanged(e, sheet, col + i, row + j);
        }
        if (((col + i + 4) % 6 == 0)) {
          dateChanged(e, sheet, col + i - 1, row + j);
        }
        if (((col + i + 5) % 6 == 0)) {
          dateChanged(e, sheet, col + i, row + j);
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
 * @param col col of event
 * @param row row of event
 */
function mainEventChanged(e, sheet, col, row) {
  if (e.value && isSelectedMainEventSpecial(e.source, e.value)) {
    sheet.getRange(row, col, 1, 3).setBackground('#ffffff');
    sheet.getRange(row, col + 1, 1, 2).setValue('');
  }
}

/**
 * Validates values of changed date
 *
 * @param e event send from spreadsheet
 * @param sheet sheet of event
 * @param col col of event
 * @param row row of event
 */
function dateChanged(e, sheet, col, row) {
  var from = sheet.getRange(row, col, 1, 1);
  var to = sheet.getRange(row, col + 1, 1, 1);

  if (from != '' && to != '' && Utils.compareTimes(from.getValue(), to.getValue()) < 0) {
    to.setValue('');
    SpreadsheetApp.getUi().alert(to.getA1Notation() + ': Od je větší než Do !')
  }
}

// for saving values
var colors, index, defaultTariff, clientsNames, clientsSpecial;

/**
 * Resolves colours and default tariff if employee selected
 *
 * @param e event send from spreadsheet
 * @param sheet sheet of event
 * @param col col of event
 * @param row row of event
 */
function employeeChanged(e, sheet, col, row) {
  var background = '#ffffff';
  var tariff = sheet.getRange(row, col + 1, 1, 1).getValue();
  if (e.value) {
    colors = colors ? colors : getData('colors', e.source);
    index = index ? index : getData('nicks', e.source).indexOf(e.value);
    defaultTariff = defaultTariff ? defaultTariff : getData('defaultTariff', e.source);
    var mainEventRange = sheet.getRange(row, col - 1, 1, 1);

    if (index > -1 && colors[index]) {
      background = colors[index];
    }

    if (defaultTariff && tariff == '') {
      tariff = defaultTariff;
    }

    if (isSelectedMainEventSpecial(e.source, mainEventRange.getValue())) {
      mainEventRange.setValue('');
    }
  }

  sheet.getRange(row, col + 1, 1, 1).setValue(tariff);
  sheet.getRange(row, col - 1, 1, 3).setBackground(background);
}

/**
 * Checks if main event is special
 *
 * @param spreadSheet spreadSheet 
 * @param value value of selected field
 * @return true if selected event is not a client
 */
function isSelectedMainEventSpecial(spreadSheet, value) {
  clientsNames = clientsNames ? clientsNames : getData('clientsNames', spreadSheet);

  var index = clientsNames.indexOf(value);
  clientsSpecial = clientsSpecial ? clientsSpecial : getData('clientsSpecial', spreadSheet);

  return (index > -1 && clientsSpecial[index] && clientsSpecial[index] == 1);
}
