function newSpreadsheetDataResult (strategy = '') {
  return {
    weekday: {
      from: -1,
      to: -1,
      length: -1,
      valid: false,
    },
    weekend: {
      from: -1,
      to: -1,
      length: -1,
      valid: false,
    },
    data: [],
    notes: [],
    valid: false,
    lastDayRow: -1,
    strategy: strategy,
  };
}

const DEFAULT_STRATEGY = "DEFAULT_STRATEGY";

//  best effort and less accurate strategies
const WEEKEND_HEADER_ONLY_STRATEGY = "WEEKEND_HEADER_ONLY_STRATEGY";
const LAST_SPACE_BETWEEN_ROWS_STRATEGY = "LAST_SPACE_BETWEEN_ROWS_STRATEGY"; // least accurate

/**
 * Extracts all data and layout of the spreadsheet
 *
 * @return {Object} which contains data and layout
 */
function extractSpreadsheetData (sheet) {
  // looks for correctly formatted headers
  let result = extractSpreadsheetDataWithStrategy(sheet, DEFAULT_STRATEGY, {})
  if (result.valid) {
    return result;
  }

  // let's assume there is at least one valid header, expect the header to be weekend and any data before that to be weekday
  result = extractSpreadsheetDataWithStrategy(sheet, WEEKEND_HEADER_ONLY_STRATEGY, {});
  if (result.valid) {
    return result;
  }

  // just do the data row detection only and do not consider headers , has potential to falsely detect weekend if there are empty rows in it
  return extractSpreadsheetDataWithStrategy(sheet, LAST_SPACE_BETWEEN_ROWS_STRATEGY, { lastDayRow: result.lastDayRow });
}

function shouldDetectMetadataRow (strategy, lookForWeekend) {
  return strategy === DEFAULT_STRATEGY || (strategy === WEEKEND_HEADER_ONLY_STRATEGY && lookForWeekend);
}


/**
 * Extracts all data and layout of the spreadsheet
 *
 * @param sheet sheet
 * @param strategy strategy to detect the data rows for weekday/weekend
 * @param opts object which can have properties lastDayRow (applicable for LAST_SPACE_BETWEEN_ROWS_STRATEGY)
 * @return {Object} which contains data and layout
 */
function extractSpreadsheetDataWithStrategy (sheet, strategy, opts) {
  const defaultRowColor = "#fff2cc"; // generated before
  const defaultSecondaryRowColor = "#e2f3ff";
  const maxNumberOfDaysPerRow = 5;
  const maxNumberOfDaysPerWeekendRow = 2;
  const dayWidth = 6;
  const considerCompleteEmptyRows = 150; // max number of rows per day
  const rowDetectionRange = sheet.getMaxRows();
  const lastDataRow = sheet.getLastRow();

  // get all data at once so we don't do many expensive calls
  const range = sheet.getRange(1, 1, rowDetectionRange, dayWidth * 5);
  const values = range.getValues();
  const displayValues = range.getDisplayValues();
  // we just need one day for these
  const validations = sheet.getRange(1, 1, rowDetectionRange, dayWidth).getDataValidations();
  const backgrounds = sheet.getRange(1, 1, rowDetectionRange, 2).getBackgrounds();

  const colorDistribution = analyzeColorDistribution_(backgrounds, 60);
  const hasOriginalColors = colorDistribution[defaultRowColor] > 0 && colorDistribution[defaultSecondaryRowColor] > 0 && Object.keys(colorDistribution).length === 2;
  const rowColor = getMaxKeyFromMap(colorDistribution) || defaultRowColor;

  let hasInitializedValidations = false;
  let lastSeenEmptyRows = [];

  const result = newSpreadsheetDataResult(strategy);

  for (let rowIdx = 0; rowIdx < rowDetectionRange; rowIdx++) {
    const nextRowValues = rowIdx + 1 < rowDetectionRange ? values[rowIdx + 1] : []
    const rowValues = values[rowIdx];
    const rowDisplayValues = displayValues[rowIdx];
    const rowValidations = validations[rowIdx];
    const rowBackgrounds = backgrounds[rowIdx];
    const row = rowIdx + 1;
    // first metadata row is recognized if we found a header and have analyzed next two data rows after that (to recognize duplicate headers)
    let lookForWeekend = result.weekday.from !== -1 && result.weekday.from !== row && result.weekday.from + 1 !== row
    // we always have weekend.to if we have found a weekend.from
    if (shouldDetectMetadataRow(strategy, lookForWeekend) && isMetadataRow_(rowValues, nextRowValues, dayWidth, maxNumberOfDaysPerRow, maxNumberOfDaysPerWeekendRow, lookForWeekend)) { // found metadata in this format: Od Do Událost
      // setup if no header set up, or if repeating headers found (need two lines to detect that)
      if (result.weekday.from === -1 || result.weekday.from === row || result.weekday.from + 1 === row) {
        // weekday starts on next row
        result.weekday.from = row + 1;
        result.weekday.to = result.weekday.from;
      } else if (result.weekend.from === -1 || result.weekend.from === row || result.weekend.from + 1 === row) {
        // weekend starts on next row
        result.weekend.from = row + 1;
        result.weekend.to = result.weekend.from;
      } else {
        // 3rd metadata not expected
        break;
      }
      continue;
    }

    // this is not exactly the sam as lookForWeekend since both are used for detecting layout of different strategies
    const maxNumberOfDaysPerThisRow = result.weekend.to !== -1 ? maxNumberOfDaysPerWeekendRow : maxNumberOfDaysPerRow;

    const daysWithData = detectDaysWithData_(rowValues, rowDisplayValues, dayWidth, maxNumberOfDaysPerThisRow);


    let isDayRow = daysWithData.length > 0; // check if has valid day data

    if (!isDayRow) {
      isDayRow = isDayRowByValidation_(rowValidations);  // check if has valid day validations
      if (isDayRow) {
        hasInitializedValidations = true; // expect the whole sheet to be initialized correctly when we find first validation
      } else if (!hasInitializedValidations || hasOriginalColors) {
        isDayRow = isDayRowByBackground_(rowBackgrounds, rowColor); // try detection by color if validations not initialized yet or no color scheme tampering detected
      }
    }

    if (isDayRow) {
      // track lastDayRow to use in other strategies
      result.lastDayRow = row;
      // try to detect header according to the strategy
      if (strategy === WEEKEND_HEADER_ONLY_STRATEGY) {
        if (result.weekday.from === -1) {
          // expect the existing header to be used for weekend
          // first day row is weekday row
          result.weekday.from = row;
          result.weekday.to = result.weekday.from;
        }
      } else if (strategy === LAST_SPACE_BETWEEN_ROWS_STRATEGY) {
        // use day rows to detect weekday
        if (result.weekday.from === -1) {
          result.weekday.from = row;
          result.weekday.to = result.weekday.from;
        }

        // now compute weekend once we reach the last day row
        if (row === opts.lastDayRow && lastSeenEmptyRows.length > 0) {
          const lastRememberedSeenEmptyRow = lastSeenEmptyRows[0];
          const lastSeenEmptyRow = lastSeenEmptyRows[lastSeenEmptyRows.length - 1];
          // only after we have found the week, weekday is not -1
          if (lastSeenEmptyRow > result.weekday.from) {
            result.weekday.to = lastRememberedSeenEmptyRow - 1;
            result.weekend.from = lastSeenEmptyRow + 1;
            result.weekend.to = row
          }
        }
      }

      // do not care about detecting headers here - just count the dates
      if (result.weekend.to !== -1) {
        // count weekend
        result.weekend.to = row;
      } else if (result.weekday.to !== -1) {
        // count weekday
        result.weekday.to = row;
      } else {
        // find header first
        continue
      }

      daysWithData.forEach(function (day) {
        let dayInWeekIdx = day;
        if (result.weekend.to !== -1) {
          dayInWeekIdx += 5;
        }
        if (dayInWeekIdx < 7) {
          result.data.push(asDayData(rowValues, rowDisplayValues, dayInWeekIdx, dayWidth));
        }
      });
    } else {
      if (strategy === LAST_SPACE_BETWEEN_ROWS_STRATEGY) {
        if (lastSeenEmptyRows.length > 0 && lastSeenEmptyRows[lastSeenEmptyRows.length - 1] === row - 1) {
          lastSeenEmptyRows = [lastSeenEmptyRows[0], row - 1, row]
        } else {
          lastSeenEmptyRows = [row];
        }
      }
    }

    if ((result.weekend.to !== -1 && row - result.weekend.to > considerCompleteEmptyRows) && lastDataRow < row) {
      // finish only if
      // - we initialized a valid result
      // - we checked at least 30 rows after a last valid day row
      // - we passed last row with data, but we need to consider the first two at the same time as well to locate the whole weekend range which might just include validations/colors
      break;
    }
  }

  // compute validity
  if (result.weekday.from !== -1 && result.weekday.to !== -1 && result.weekday.from <= result.weekday.to) {
    result.weekday.valid = true;
  }
  if (result.weekend.from !== -1 && result.weekend.to !== -1 && result.weekend.from <= result.weekend.to) {
    result.weekend.valid = true;
  }
  if (result.weekday.valid && result.weekend.valid) {
    result.valid = true;
  }

  // compute lengths
  if (result.weekday.valid) {
    result.weekday.length = result.weekday.to - result.weekday.from + 1;
  }
  if (result.weekend.valid) {
    result.weekend.length = result.weekend.to - result.weekend.from + 1;
  }

  // compute notes
  if (result.valid) {
    // compute weekday notes
    // there has to be at least 3 rows between weekend and weekday block as 2 rows are occupied by metadata and day name
    let minGap = 3;
    if (strategy === LAST_SPACE_BETWEEN_ROWS_STRATEGY) {
      // there is no metadata - let's resign to just 1 row gap
      minGap = 1;
    }
    if (result.weekend.from - result.weekday.to > minGap) {
      const weekdayToIdx = result.weekday.to - 1;
      const rowValues = values[weekdayToIdx + 1]; // next row is most likely notes
      const notesWithData = detectNotesWithData_(rowValues, dayWidth, maxNumberOfDaysPerRow);
      notesWithData.forEach(function (dayInWeekIdx) {
        result.notes.push(asNotesData(rowValues, dayInWeekIdx, dayWidth));
      });
    }
    // compute weekend notes
    const weekendToIdx = result.weekend.to - 1;
    const rowValues = values[weekendToIdx + 1]; // next row is most likely notes
    const notesWithData = detectNotesWithData_(rowValues, dayWidth, maxNumberOfDaysPerWeekendRow);
    notesWithData.forEach(function (dayInWeekIdx) {
      result.notes.push(asNotesData(rowValues, dayInWeekIdx + 5, dayWidth)); // +5 for weekend diff
    });
  }

  return result;
}

const rowMetadataDayNames = ['Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota', 'Neděle'];
const rowMetadataNames = ['Od', 'Do', 'Událost', 'Kdo', 'Pásmo', 'Pozn'];

// finds metadata in this format:
//                      Úterý 31. 5.
// Od Do Událost
function isMetadataRow_ (values, nextRowValues, dayWidth, numberOfDaysPerRow, numberOfDaysPerWeekendRow, lookForWeekend) {
  const maxNumberOfDaysPerRow = lookForWeekend ? numberOfDaysPerWeekendRow : numberOfDaysPerRow;
  const findMinMetadataDays = lookForWeekend ? 1 : 3;
  const dayNamesStartIdx = lookForWeekend ? numberOfDaysPerRow : 0;

  let metadataDaysFound = 0;
  let nextMetadataDaysFound = 0;
  let daysFound = 0;

  for (let day = 0; day < maxNumberOfDaysPerRow; day++) {
    try {
      const columnStart = day * dayWidth;

      let metadataNamesFound = 0;
      let nextMetadataNamesFound = 0;

      for (let columnIdx = columnStart; columnIdx < columnStart + dayWidth; columnIdx++) {
        const expectedMetadataName = rowMetadataNames[columnIdx - columnStart];

        const value = values && columnIdx < values.length ? values[columnIdx] : "";
        if (value === expectedMetadataName) {
          metadataNamesFound += 1;
        }

        // if the next row does not have MetadataNames this row is qualified as a MetadataRow if it has dayNames
        const nextValue = nextRowValues && columnIdx < nextRowValues.length ? nextRowValues[columnIdx] : "";
        if (nextValue === expectedMetadataName) {
          nextMetadataNamesFound += 1;
        }
      }
      // find at least 3 occurrences of metadata in a day to classify it as a metadata day
      if (metadataNamesFound >= 3) {
        metadataDaysFound += 1
      }
      if (nextMetadataNamesFound >= 3) {
        nextMetadataDaysFound += 1
      }

      // check if this day is the expected day of week
      const value = values && columnStart < values.length ? values[columnStart] : "";
      const expectedDay = rowMetadataDayNames[dayNamesStartIdx + day]
      if (typeof value === 'string' && value.startsWith(expectedDay)) {
        daysFound += 1
      }
    } catch (err) {
      logError('isMetadataRow_: ' + err);
    }
  }


  // find at least findMinMetadataDays occurrences of metadata in such number of days to classify it as a metadata row
  if (metadataDaysFound >= findMinMetadataDays) {
    return true;
  }

  let isNextRowMetadataRow = false;
  if (nextMetadataDaysFound >= findMinMetadataDays) {
    isNextRowMetadataRow = true
  }

  // find at least 2 description of days in all days to classify it as a metadata row
  // also the next row should not be metadata row as it will be detected in the next iteration
  if (daysFound >= 2 && !isNextRowMetadataRow) {
    return true;
  }
  return false;
}

const validTimeRegex_ = new RegExp("^((([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9])|24:00:00)$");

function detectDaysWithData_ (values, displayValues, dayWidth, maxNumberOfDaysPerRow) {
  const daysWithData = [];
  if (values && displayValues) {
    for (let day = 0; day < maxNumberOfDaysPerRow && day * dayWidth + 1 < values.length && day * dayWidth + 1 < displayValues.length; day++) {
      try {
        const column = day * dayWidth;

        // we have a day row if we have valid from and to formats
        const fromDisplayValue = ensureString(displayValues[column]);
        const toDisplayValue = ensureString(displayValues[column + 1]);

        const fromDate = new Date(values[column]);
        const toDate = new Date(values[column + 1]);

        if (!isNaN(fromDate) && !isNaN(toDate) && toDate.getTime() - fromDate.getTime() > 0 && validTimeRegex_.test(fromDisplayValue) && validTimeRegex_.test(toDisplayValue)) {
          daysWithData.push(day);
        }
      } catch (err) {
        logError('getDaysWithData: ' + err);
      }
    }
  }
  return daysWithData;
}

function detectNotesWithData_ (values, dayWidth, maxNumberOfDaysPerRow) {
  const daysWithNotes = [];

  if (values) {
    for (let dayIdx = 0; dayIdx < maxNumberOfDaysPerRow; dayIdx++) {
      for (let column = dayIdx * dayWidth; column < dayIdx * dayWidth + dayWidth && column < values.length; column++) {
        const value = ensureString(values[column]);
        if (value !== "") {
          daysWithNotes.push(dayIdx);
          break;
        }
      }
    }
  }
  return daysWithNotes;
}

// we have a day row if we have an employee cell with validation
// don't call often due to high cost
function isDayRowByValidation_ (validations) {
  if (!validations) {
    return false;
  }
  try {
    const eventRule = validations[3];
    if (eventRule != null && eventRule.getCriteriaType() === SpreadsheetApp.DataValidationCriteria.VALUE_IN_LIST) {
      return true;
    }
  } catch (err) {
    logError('isDayRowByValidation_: ' + err);
  }

  return false;
}

function isDayRowByBackground_ (backgrounds, rowColor) {
  return !!(backgrounds && rowColor && backgrounds[0] === rowColor && backgrounds[1] === rowColor);
}

function asDayData (values, displayValues, dayInWeekIdx, dayWidth) {
  if (!values) {
    values = [];
  }

  if (!displayValues) {
    displayValues = [];
  }

  const dayIdx = dayInWeekIdx % 5;
  const dayStartColumn = dayWidth * dayIdx;

  const fromDate = new Date(values[dayStartColumn]);
  const toDate = new Date(values[dayStartColumn + 1]);

  return {
    from: ensureString(displayValues[dayStartColumn]),
    to: ensureString(displayValues[dayStartColumn + 1]),
    fromDate: fromDate,
    toDate: toDate,
    event: ensureString(values[dayStartColumn + 2]),
    employee: ensureString(values[dayStartColumn + 3]),
    tariff: ensureString(values[dayStartColumn + 4]),
    note: ensureString(displayValues[dayStartColumn + 5]),
    duration: (toDate.getTime() - fromDate.getTime()) % 86400000, // in case dates are different
    dayInWeekIdx: dayInWeekIdx,
  };
}


function asNotesData (values, dayInWeekIdx, dayWidth) {
  const dayIdx = dayInWeekIdx % 5;
  const result = [];

  if (values) {
    for (let column = dayIdx * dayWidth; column < dayIdx * dayWidth + dayWidth && column < values.length; column++) {
      const value = ensureString(values[column]);
      result.push(value);
    }
  }

  return {
    values: result,
    dayInWeekIdx: dayInWeekIdx,
  };
}

function ensureString (value) {
  if (value == null) {
    return ""
  }
  return value + ""
}

function analyzeColorDistribution_ (backgrounds, maxRowsToAnalyze) {
  const colors = {};

  if (!backgrounds) {
    return colors;
  }

  // do not over analyze - there might be many cells under the time spread sheet
  let rowsToAnalyze = maxRowsToAnalyze || backgrounds.length;
  if (backgrounds.length < rowsToAnalyze) {
    rowsToAnalyze = backgrounds.length;
  }

  for (let row = 0; row < rowsToAnalyze; row++) {
    for (let col = 0; col < backgrounds[row].length; col++) {
      const color = backgrounds[row][col];
      if (color in colors) {
        colors[color] += 1;
      } else {
        colors[color] = 1;
      }
    }
  }
  // remove default color from distribution
  delete colors["#ffffff"];
  // remove empty from distribution
  delete colors[""];
  delete colors["null"];
  delete colors["undefined"];
  return colors;
}

function getMaxKeyFromMap (input) {
  let max = -1;
  let result = "";

  Object.keys(input).forEach(function (key) {
    if (input[key] > max) {
      max = input[key];
      result = key;
    }
  });

  return result;
}
