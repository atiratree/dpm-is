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
      filename = obj.type + '_' + getFormatedDate(new Date()) + '_' + obj.details;
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

  if (obj.type === 'Rozpis') {
    createFile(obj);
  }

  return ss;
}

/**
 * Extracts all valid data from 'Rozpis' files in defined time span.
 *
 * @param from from which date to start extracting
 * @param to to which date extract data
 * @param groups to which groups to extract data from
 * @return {Array<Object>} array of extracted data
 */
function extractAllSpreadsheetData(from, to, groups) {
  const result = [];
  const stopTimer = measureTime();

  findFiles([], {
    type: 'Rozpis'
  }).filter(function(file) {
    if (groups != null && !groups.has(file.group)) {
      return false;
    }
    return isWeekWithinDates(from, to, file.year, file.week);
  }).forEach(function(item) {
    const ss = openSpreadsheet(item.id);

    // expectation is that the script runs always under the same time zone, which is Europe/Prague
    const monday = new Date(item.weekStarts);
    const dayInfos = [];

    for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
      const day = new Date(monday);

      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() + dayIdx); // rollovers to the next month if necessary

      dayInfos.push({
        date: day,
        dayInWeekIdx: dayIdx,
        extract: compareDates(from, day) >= 0 && compareDates(day, to) >= 0,
      });
    }

    const scheduleSheet = ss.getSheetByName('Rozpis') || ss.getSheets()[0]
    const layoutAndData = extractSpreadsheetData(scheduleSheet);
    const data = layoutAndData.data.filter(function(item) {
      const dayInfo = dayInfos[item.dayInWeekIdx];
      return dayInfo && dayInfo.extract
    }).map(function(item) {
      const dayInfo = dayInfos[item.dayInWeekIdx];
      if (dayInfo) {
        item.date = dayInfo.date;
      }
      return item;
    });


    result.push.apply(result, data);

    if (stopTimer() / 1000 > 250){ // more than 250s -- abort - 50 sec left for the rest of the script which is billing/stat
      throw {timeout: true};
    }
  });

  return result
}
