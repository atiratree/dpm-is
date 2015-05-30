/** 
 * Creates SpreadSheet and names it and stores it in location depending on obj.type.
 *   Possible values for type are 'Rozpis' 'Statistika' and 'Fakturace' 
 *
 * @param obj object which can have properties type, year, week, group
 * @return SpreadSheet or null if obj.type is invalid
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

  if (isSuperAdmin()) {
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
 * @return array of extracted data
 */
function getAllSpreadSheetData(from, to) {
  var files = findFiles([], {
    type: 'Rozpis'
  });
  var fromWeek = getWeekNumber(from);
  var fromYear = from.getFullYear();
  var toWeek = getWeekNumber(to);
  var toYear = to.getFullYear();
  var result = [];

  files = files.filter(function(item) {
    var year = item.year;
    var week = item.week;

    if (year < fromYear || (year == fromYear && week < fromWeek)) {
      return false;
    }

    if (toYear < year || (year == toYear && toWeek < week)) {
      return false;
    }
    return true;
  });

  files.forEach(function(item) {
    var ss = SpreadsheetApp.openById(item.id);
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
  });

  return result
}

/** 
 * Extracts data from one spreadsheet
 *
 * @param sheet from which date to start extracting
 * @return extractDays array of days in week(1-7) for extracting
 * @return array of extracted data
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
 * @return array of extracted data
 */
function getDayRange_(sheet, row, column, numberOfRows, width, date) {
  var result = [];
  column = (column * width) - width + 1;
  var values = sheet.getSheetValues(row, column, numberOfRows, width);

  values.forEach(function(row) {
    var from = row[0];
    var to = row[1];

    if (from != '' && to != '') {
      var fromDate = new Date(from);
      var toDate = new Date(to);

      if (!isNaN(fromDate) && !isNaN(toDate) && toDate.getTime() - fromDate.getTime() > 0) {
        result.push({
          from: from,
          to: to,
          event: row[2],
          employee: row[3],
          tariff: row[4],
          note: row[5],
          duration: (toDate.getTime() - fromDate.getTime()) % 86400000, // in case dates are different
          date: date
        });
      }
    }
  });
  return result;
}
