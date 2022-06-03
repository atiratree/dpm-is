
/**
 * Copies data between to sheet. Also sorts the data.
 *
 * @param sheet spreadsheet to be coppied into
 * @param data data from main spreadsheet
 * @param notes notes from main spreadsheet
 * @param weekdayRows number of rows per weekday
 * @param weekendRows number of rows per weekend
 * @param smallLayout if true uses small layout
 */
function writeDataToSheet(sheet, data, notes,  weekdayRows, weekendRows, smallLayout){
  var firstDays = smallLayout ? 3 : 5;
  var secondDays = 2;

  var firstRowStart = 5;
  var secondRowStart = firstRowStart + weekdayRows + 4;
  var thirdRowStart = smallLayout ? secondRowStart + weekdayRows + 4 : 0;

  var firstRows = smallLayout ? weekdayRows : weekdayRows;
  var secondRows = smallLayout ? weekdayRows : weekendRows;
  var thirdRows = smallLayout ? weekendRows : 0;

  for (var dayInWeekIdx = 0; dayInWeekIdx < 7; dayInWeekIdx++) {
    var cleanData = data.filter(function(a) {
      return a.dayInWeekIdx == dayInWeekIdx;
    }).sort(function(a, b) {
      return a.fromDate - b.fromDate;
    }).map(function(a) {
      return [a.from, a.to, a.event, a.employee, a.tariff, a.note];
    });

    var cleanNotes = notes.filter(function(a) {
      return a.dayInWeekIdx == dayInWeekIdx;
    })

    var notesValues = cleanNotes.length > 0 ? cleanNotes[0].values : null;

    if (dayInWeekIdx < firstDays) {
      writeDayRange(sheet, firstRowStart, (dayInWeekIdx  * 6) + 1, firstRows, cleanData, notesValues);
    } else if (dayInWeekIdx < firstDays + secondDays){
      writeDayRange(sheet, secondRowStart, ((dayInWeekIdx - firstDays) * 6) + 1, secondRows, cleanData, notesValues);
    }else{
      writeDayRange(sheet, thirdRowStart, ((dayInWeekIdx - firstDays - secondDays) * 6) + 1, thirdRows, cleanData, notesValues);
    }
  }
}

/**
 * Writes data of one day to a sheet
 *
 * @param sheet spreadsheet to be coppied into
 * @param row row of sheet to start writing data
 * @param column column of a block to start writing data, block has 6 columns
 * @param numberOfRows numberOfRows of one day
 * @param data data to be written in sheet
 * @param notes notes to be written in sheet
 */
function writeDayRange(sheet, row, column, numberOfRows, data, notes) {
  if(row == null)
    return

  var allRange = sheet.getRange(row, column, numberOfRows + 1, 6);
  var timesRange = sheet.getRange(row, column, numberOfRows, 2);

  // clear stale data and notes bellow
  allRange.setValue('');
  timesRange.setNumberFormat('hh:mm:ss');

  if (data.length > 0) {
    sheet.getRange(row, column, data.length, 6).setValues(data);
  }

  if(notes && notes.length > 0) {
    sheet.getRange(row + numberOfRows, column, 1, 6).setValues([notes]);
  }
}
