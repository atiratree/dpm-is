/** 
 * Formatts sheet as schedule.
 *
 * @param sheet to be formatted
 * @param day date which is the beginning of week (should be monday)
 * @param messages array of strings of length 3, these strings are going to be shown in a sheet
 */
function prepareSheet(sheet, day, messages) {
  var width = 6; // num of columns per day

  sheet.getRange(1, 1, 1, 100).setFontWeight('bold').setFontSize(15);
  sheet.setRowHeight(1, 15);
  sheet.getRange(1, 1).setValue(messages[0]);
  sheet.getRange(1, 7).setValue(messages[1]);
  sheet.getRange(1, 13).setValue(messages[2]);

  for (var i = 1; i < 6; i++) {
    createDayRange_(sheet, 3, i, 28, width, getWeekDayString_(i, day));

    sheet.setColumnWidth(i * width - 5, 55);
    sheet.setColumnWidth(i * width - 4, 55);
    sheet.setColumnWidth(i * width - 2, 55);
    sheet.setColumnWidth(i * width - 1, 35);
    sheet.setColumnWidth(i * width, 55);
  }

  for (var i = 1; i < 3; i++) {
    createDayRange_(sheet, 35, i, 20, width, getWeekDayString_(i + 5, day));
  }
}

/** 
 * Formats day in sheet.
 *
 * @param sheet to be formatted
 * @param row row where formatting starts
 * @param column column where formatting starts
 * @param numberOfRows numberOfRows to be formatted
 * @param width width number of rows to be formatted
 * @param weekDayString string of a day in a week
 */
function createDayRange_(sheet, row, column, numberOfRows, width, weekDayString) {
  var block = column * width;
  var timesRange = sheet.getRange(row + 2, block - 5, numberOfRows, 2);
  var noteRange = sheet.getRange(row + 2 + numberOfRows, block - 5, 1, 6);

  sheet.getRange(row, block - 5, 1, 1).setValue(weekDayString);
  row++;
  sheet.getRange(row, block - 5, 1, 1).setValue('Od');
  sheet.getRange(row, block - 4, 1, 1).setValue('Do');
  sheet.getRange(row, block - 3, 1, 1).setValue('Událost');
  sheet.getRange(row, block - 2, 1, 1).setValue('Kdo');
  sheet.getRange(row, block - 1, 1, 1).setValue('Pásmo');
  sheet.getRange(row, block, 1, 1).setValue('Pozn');

  timesRange.setBackground('#fff2cc');
  noteRange.setBackground('#e2f3ff');
}

/** 
 * Takes monday + dayInWeek and formats it into string.
 *
 * @param dayInWeek dayInWeek 1-7
 * @param monday monday
 * @return messages array of strings of length 3, these strings are going to be shown in a sheet
 */
function getWeekDayString_(dayInWeek, monday) {
  var weekDays = getWeekDaysNames();
  var weekDay = new Date(monday);

  weekDay.setDate(weekDay.getDate() - 1 + dayInWeek);

  return weekDays[dayInWeek - 1] + ' ' + weekDay.getDate() + '. ' + (weekDay.getMonth() + 1) + '.';
}
