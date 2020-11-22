/**
 * Formatts sheet as schedule.
 *
 * @param sheet to be formatted
 * @param day date which is the beginning of week (should be monday)
 * @param messages array of strings of length 3, these strings are going to be shown in a sheet
 * @param smallLayout if true uses small layout
 */
function prepareSheet(sheet, day, messages, smallLayout) {
  var width = 6; // num of columns per day

  var firstDays = smallLayout ? 3 : 5;
  var secondDays = 2;
  var thirdDays = smallLayout ? 2 : 0;

  var firstRow = 3;
  var secondRow = smallLayout ? 22 : 35;
  var thirdRow = smallLayout ? 41 : 0;

  var firstRows = smallLayout ? 15 : 28;
  var secondRows = smallLayout ? 15 : 20;
  var thirdRows = smallLayout ? 15 : 0;

  sheet.getRange(1, 1, 1, 100).setFontWeight('bold').setFontSize(15);
  sheet.setRowHeight(1, 15);
  sheet.getRange(1, 1).setValue(messages[0]);
  sheet.getRange(1, 7).setValue(messages[1]);
  sheet.getRange(1, 12).setValue(messages[2]);

  for (var i = 1; i < firstDays + 1; i++) {
    createDayRange_(sheet, firstRow, i * width, firstRows, getWeekDayString_(i, day));


    sheet.setColumnWidth(i * width - 5, 55);
    sheet.setColumnWidth(i * width - 4, 55);
    sheet.setColumnWidth(i * width - 2, 55);
    sheet.setColumnWidth(i * width - 1, 35);
    sheet.setColumnWidth(i * width, 55);
  }

  for (var i = 1; i < secondDays + 1; i++) {
    createDayRange_(sheet, secondRow, i * width, secondRows, getWeekDayString_(i + firstDays , day));
  }

  for (var i = 1; i < thirdDays + 1; i++) {
    createDayRange_(sheet, thirdRow, i * width, thirdRows, getWeekDayString_(i + firstDays + secondDays, day));
  }

}

/**
 * Formats day in sheet.
 *
 * @param sheet to be formatted
 * @param row row where formatting starts
 * @param block last column  of block to start writing data, block has 6 columns
 * @param numberOfRows numberOfRows to be formatted
 * @param weekDayString string of a day in a week
 */
function createDayRange_(sheet, row, block, numberOfRows, weekDayString) {
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
 * @return {Array<string>} messages array of strings of length 3, these strings are going to be shown in a sheet
 */
function getWeekDayString_(dayInWeek, monday) {
  var weekDays = getWeekDaysNames();
  var weekDay = new Date(monday);

  weekDay.setDate(weekDay.getDate() - 1 + dayInWeek);

  return weekDays[dayInWeek - 1] + ' ' + weekDay.getDate() + '. ' + (weekDay.getMonth() + 1) + '.';
}
