/**
 * Creates statistics spreadsheet in user's google drive and generates data into it
 *
 * @param from from which day stats are going to be created
 * @param to  to which day stats are going to be created
 * @return {string} url of new spreadsheet
 */
function createStatistics(from, to) {
  let spreadsheetData = Utils.extractAllSpreadsheetData(from, to); // can throw timeout
  const ss = Utils.createSpreadsheet({
    type: 'Statistika'
  });
  const clientsSheet = ss.getActiveSheet();
  const clientsSheet2 = ss.insertSheet('Klienti Počet návštěv');
  const assistantsSheet = ss.insertSheet('Asistenti');
  const events = Utils.convertObjectsToArrayByProperty(Utils.findEvents(), 'name');
  const eventsMap = {}
  for (let i = 0; i < events.length; i++) {
    eventsMap[events[i]] = true
  }

  clientsSheet.setName('Klienti');

  spreadsheetData = spreadsheetData.filter(function(item) {
     return !eventsMap[item['event']];
  });

  writeStats(spreadsheetData, clientsSheet, 'event', from, to, false);
  writeStats(spreadsheetData, clientsSheet2, 'event', from, to, true);
  writeStats(spreadsheetData, assistantsSheet, 'employee', from, to, false);
  return ss.getUrl();
}

/**
 * Writes statistics into the sheet
 *
 * @param spreadsheetData data to write into sheet
 * @param sheet sheet
 * @param type switches writing stats to different modes
 * @param from from which data to write stats
 * @param to to which data to write stats
 * @param onlyCount measure occurences count instead of duration
 */
function writeStats(spreadsheetData, sheet, type, from, to, onlyCount) {
  const months = Utils.getMonthsNames();
  // stats = {
  //   "John": {
  //     "202009": {
  //       "duration": 5
  //     },
  //     "202210": {
  //       "duration": 105791
  //     }
  //   }
  // }
  const stats = {};
  const foundMonths = {};
  const foundNames = {};

  spreadsheetData.forEach(function(item) {
    const clientOrEmployeeName = item[type];

    if (clientOrEmployeeName && item.tariff) {
      const monthIdx = item.date.getMonth();
      const month = monthIdx + 1;
      const yearMonthID = item.date.getFullYear() + '' + (month < 10 ? '0' + month : month);

      foundMonths[yearMonthID] = months[monthIdx] + ' ' + item.date.getFullYear();
      foundNames[clientOrEmployeeName] = true;

      if (!stats[clientOrEmployeeName]) {
        stats[clientOrEmployeeName] = {};
      }
      const dataForName = stats[clientOrEmployeeName];
      if (!dataForName[yearMonthID]) {
        dataForName[yearMonthID] = {
          duration: onlyCount ? 1 : item.duration
        };
      } else {
        dataForName[yearMonthID].duration += onlyCount ? 1 : item.duration;
      }
    }
  });

  const sortedFoundNames = getSortedObjProps(foundNames);
  const sortedFoundMonths = getSortedObjProps(foundMonths);

  const foundNamesSums = new Array(sortedFoundNames.length).fill(0);
  const monthsSums =  new Array(sortedFoundMonths.length).fill(0);

  // write stat for each name in each month and collect summaries
  for (let i = 0; i < sortedFoundMonths.length; i++) {
    const foundMonth = sortedFoundMonths[i];
    for (let j = 0; j < sortedFoundNames.length; j++) {
      const foundName = sortedFoundNames[j];
      let statElement = stats[foundName][foundMonth];
      let duration = 0;

      if (statElement) {
        duration = statElement.duration;
        foundNamesSums[j] += duration;
        monthsSums[i] += duration;
      }
      writeToCellSpec(sheet, j + 2, i + 2, {
        value: duration,
        isDuration: !onlyCount
      });
    }
  }

  // write names and summaries
  for (let i = 0; i < sortedFoundNames.length; i++) {
    writeToCellSpec(sheet, i + 2, 1, {
      value: sortedFoundNames[i],
      color: '#FFF2CC'
    });
    writeToCellSpec(sheet, i + 2, monthsSums.length + 2, {
      value: foundNamesSums[i],
      isDuration: !onlyCount,
      color: '#E2F3FF'
    });
  }

  // write months header and summaries
  for (let i = 0; i < sortedFoundMonths.length; i++) {
    writeToCellSpec(sheet, 1, i + 2, {
      value: foundMonths[sortedFoundMonths[i]],
      color: '#FFF2CC'
    });
    writeToCellSpec(sheet, sortedFoundNames.length + 2, i + 2, {
      value: monthsSums[i],
      isDuration: !onlyCount,
      color: '#E2F3FF'
    });
  }
  writeToCell(sheet, sortedFoundNames.length + 8, 1, '* Statistika v časovém období: ' + Utils.getFormatedDate(from, true) + ' - ' + Utils.getFormatedDate(
    to, true));
}

/**
 * Writes data to specific cell in a format specified in obj
 *
 * @param sheet where to write
 * @param row where to write
 * @param col where to write
 * @param obj obj with input data and its format (as {value: xx, color: xx, isDuration: xx, roundPrice: xx, oneDigitFormat: xx, twoDigitFormat: xx})
 */
function writeToCellSpec(sheet, row, col, obj) {
  const cell = sheet.getRange(row, col);
  let value = obj.value;
  const color = obj.color;

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
