/**
 * Creates SpreadSheet and names it and stores it in location depending on obj.type.
 *   Possible values for type are 'Rozpis' 'Statistika' and 'Fakturace'
 *
 * @param obj object which can have properties type, year, week, group
 * @return {Object} SpreadSheet or null if obj.type is invalid
 */
function createSpreadsheet(obj) {
  var filename;

  switch (obj.type) {
    case 'Rozpis':
      filename = obj.year + '_' + obj.week + '_' + obj.group;
      break;
    case 'Statistika':
    case 'Fakturace':
      filename = obj.type + '_' + getFormatedDate(new Date());
      break;
    default:
      return;
  }

  var ss = SpreadsheetApp.create(filename);
  var file = DriveApp.getFileById(ss.getId());
  obj.id = ss.getId();
  obj.url = ss.getUrl();

  if (isMainAdmin()) {
    moveFile_(file, obj.type, obj.year, obj.week);
  }

  if (obj.type == 'Rozpis') {
    createFile(obj);
  }

  return ss;
}

/**
 * Extracts all valid data from 'Rozpis' files in defined time span.
 *
 * @param from from which date to start extracting
 * @param to to which date extract data
 * @return {Array<Object>} array of extracted data
 */
function getAllSpreadSheetData(from, to) {
  var result = [];
  const stopTimer = measureTime();

  findFiles([], {
    type: 'Rozpis'
  }).filter(function(file) {
    return isWeekWithinDates(from, to, file.year, file.week);;
  }).forEach(function(item) {
    var ss = openSpreadsheet(item.id);

    var monday = new Date(item.weekStarts);
    var extractDays = [];

    for (var add = 0; add < 7; add++) {
      var day = new Date(monday);

      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() + add);

      if (compareDates(from, day) >= 0 && compareDates(day, to) >= 0) {
        extractDays.push({
          date: day,
          dayInWeek: (add + 1)
        });
      }
    }

    result.push.apply(result, extractSpreadSheet(ss.getSheetByName('Rozpis'), extractDays));

    if (stopTimer() / 1000 > 250){ // more than 250s -- abort - 50 sec left for the rest of the script wchich is billing/stat
      throw {timeout: true};
    }
  });

  return result
}

/**
 * Extracts data from one spreadsheet
 *
 * @param sheet from which date to start extracting
 * @return extractDays array of days in week(1-7) for extracting
 * @return {Array<Object>} array of extracted data
 */
function extractSpreadSheet(sheet, extractDays) {
  var result = [];

  extractDays.forEach(function(dayItem) {
    var date = dayItem.date ? dayItem.date : null;

    if (dayItem.dayInWeek < 6) {
      result.push.apply(result, getDayRange_(sheet, 5, dayItem.dayInWeek, 28, 6, date));
    } else {
      result.push.apply(result, getDayRange_(sheet, 37, dayItem.dayInWeek - 5, 20, 6, date));
    }
  });
  return result;
}

/**
 * Extracts data day range
 *
 * @return {Array<Object>} array of extracted data
 */
function getDayRange_(sheet, row, column, numberOfRows, width, date) {
  var result = [];
  column = (column * width) - width + 1;
  const valuesRange = sheet.getRange(row, column, numberOfRows, width);
  const displayValues = valuesRange.getDisplayValues();
  const values = valuesRange.getValues();

  values.forEach(function(valueRow, valueRowIdx) {
    var from = valueRow[0];
    var to = valueRow[1];

    if (from != '' && to != '') {
      var fromDate = new Date(from);
      var toDate = new Date(to);

      if (!isNaN(fromDate) && !isNaN(toDate) && toDate.getTime() - fromDate.getTime() > 0) {
        result.push({
          from: displayValues[valueRowIdx][0],
          to: displayValues[valueRowIdx][1],
          fromDate: fromDate,
          toDate: toDate,
          event: valueRow[2],
          employee: valueRow[3],
          tariff: valueRow[4],
          note: valueRow[5],
          duration: (toDate.getTime() - fromDate.getTime()) % 86400000, // in case dates are different
          date: date
        });
      }
    }
  });
  return result;
}
