/**
 * Creates statistics spreadsheet in user's google drive and generates data into it
 *
 * @param from from which day stats are going to be created
 * @param to  to which day stats are going to be created
 * @return {string} url of new spreadsheet
 */
function createStatistics(from, to) {
  var spreadsheetData = Utils.getAllSpreadSheetData(from, to);
  var ss = Utils.createSpreadsheet({
    type: 'Statistika'
  });
  var clientsSheet = ss.getActiveSheet();
  var clientsSheet2 = ss.insertSheet('Klienti Počet návštěv');
  var assistantsSheet = ss.insertSheet('Asistenti');
  var events = Utils.convertObjectsToArrayByProperty(Utils.findEvents(), 'name');

  clientsSheet.setName('Klienti');

  spreadsheetData = spreadsheetData.filter(function(item) {
     return (events.indexOf(item['event']) < 0);
  });

  writeStats(spreadsheetData, clientsSheet, 'event', from, to);
  writeStats(spreadsheetData, clientsSheet2, 'event2', from, to);
  writeStats(spreadsheetData, assistantsSheet, 'employee', from, to);
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
 */
function writeStats(spreadsheetData, sheet, type, from, to) {
  var sortedExtractObjs, sortedMonths;
  var extractObjSums = [];
  var monthsSums = [];
  var result = {};
  var allMonths = {};
  var allExtractObjs = {};
  var months = Utils.getMonthsNames();
  var onlyCount = (type == 'event2');
  type = onlyCount ? 'event' : type;

  spreadsheetData.forEach(function(item) {
    var extractObj, monthObj, identifier, month;

    if (item[type] && item.tariff) {

      if (!result[item[type]]) {
        result[item[type]] = {};
      }
      extractObj = result[item[type]];

      month = item.date.getMonth() + 1;
      identifier = item.date.getFullYear() + '' + (month < 10 ? '0' + month : month);

      allMonths[identifier] = months[month - 1] + ' ' + item.date.getFullYear();
      allExtractObjs[item[type]] = true;

      if (!extractObj[identifier]) {
        extractObj[identifier] = {
          duration: onlyCount ? 1 : item.duration
        };
      } else {
        extractObj[identifier].duration += onlyCount ? 1 : item.duration;
      }
    }
  });

  sortedExtractObjs = getSortedObjProps(allExtractObjs);
  sortedMonths = getSortedObjProps(allMonths);

  extractObjSums = Array.apply(null, new Array(sortedExtractObjs.length)).map(Number.prototype.valueOf, 0);
  monthsSums = Array.apply(null, new Array(sortedMonths.length)).map(Number.prototype.valueOf, 0);

  for (var i = 0; i < sortedMonths.length; i++) {
    for (var j = 0; j < sortedExtractObjs.length; j++) {
      var ev = result[sortedExtractObjs[j]][sortedMonths[i]];
      var duration = 0;

      if (ev) {
        duration = ev.duration;
        extractObjSums[j] += duration;
        monthsSums[i] += duration;
      }
      writeToCellSpec(sheet, j + 2, i + 2, {
        value: duration,
        isDuration: !onlyCount
      });
    }
  }

  for (var i = 0; i < sortedExtractObjs.length; i++) {
    writeToCellSpec(sheet, i + 2, 1, {
      value: sortedExtractObjs[i],
      color: '#FFF2CC'
    });
    writeToCellSpec(sheet, i + 2, monthsSums.length + 2, {
      value: extractObjSums[i],
      isDuration: !onlyCount,
      color: '#E2F3FF'
    });
  }

  for (var i = 0; i < sortedMonths.length; i++) {
    writeToCellSpec(sheet, 1, i + 2, {
      value: allMonths[sortedMonths[i]],
      color: '#FFF2CC'
    });
    writeToCellSpec(sheet, sortedExtractObjs.length + 2, i + 2, {
      value: monthsSums[i],
      isDuration: !onlyCount,
      color: '#E2F3FF'
    });
  }
  writeToCell(sheet, sortedExtractObjs.length + 8, 1, '* Statistika v časovém období: ' + Utils.getFormatedDate(from, true) + ' - ' + Utils.getFormatedDate(
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
