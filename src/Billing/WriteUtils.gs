/**
 * Writes data to specific cell in a format specified in obj
 *
 * @param sheet where to write
 * @param row where to write
 * @param col where to write
 * @param obj obj with input data and its format (as {value: xx, color: xx, isDuration: xx, roundPrice: xx, oneDigitFormat: xx, twoDigitFormat: xx})
 */
function writeToCellSpec(sheet, row, col, obj) {
  var cell = sheet.getRange(row, col);
  var value = obj.value;
  var color = obj.color;

  if (obj.isDuration === true) {
    cell.setNumberFormat('[h]:mm:ss');
    value = msToTime(value);
  }

  if (obj.roundPrice === true) {
    value = roundToTwo(value);
  }

  if (obj.oneDigitFormat === true) {
    cell.setNumberFormat('0.0');
  }

  if (obj.twoDigitFormat === true) {
    cell.setNumberFormat('0.00');
  }

  if (color) {
    cell.setBackground(color);
  }

  cell.setValue(value);
}

/**
 * Writes data to specific cell
 *
 * @param sheet where to write
 * @param row where to write
 * @param col where to write
 * @param value value to write
 */
function writeToCell(sheet, row, col, value) {
  sheet.getRange(row, col).setValue(value);
}
