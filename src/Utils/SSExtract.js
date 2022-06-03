function newSpreadsheetDataResult () {
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
  };
}


/**
 * Extracts all data and layout of the spreadsheet
 *
 * @return {Object} which contains data and layout
 */
function extractSpreadsheetData (sheet) {
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
  const hasOriginalColors = colorDistribution[defaultRowColor] > 0 && colorDistribution[defaultSecondaryRowColor] > 0 && Object.keys(colorDistribution).length == 2;
  const rowColor = getMaxKeyFromMap(colorDistribution) || defaultRowColor;

  let hasInitializedValidations = false;

  const result = newSpreadsheetDataResult();

  for (let rowIdx = 0; rowIdx < rowDetectionRange; rowIdx++) {
    const rowValues = values[rowIdx];
    const rowDisplayValues = displayValues[rowIdx];
    const rowValidations = validations[rowIdx];
    const rowBackgrounds = backgrounds[rowIdx];
    const row = rowIdx + 1;
    // we always have weekend.to if we have found a weekend.from
    const maxNumberOfDaysPerThisRow = result.weekend.to !== -1 ? maxNumberOfDaysPerWeekendRow : maxNumberOfDaysPerRow;

    if (isMetadataRow_(rowValues, dayWidth, maxNumberOfDaysPerThisRow)) { // found metadata in this format: Od Do Událost
      // setup if no header set up, or if repeating headers found
      if (result.weekday.from === -1 || result.weekday.from === row) {
        // weekday starts on next row
        result.weekday.from = row + 1;
        result.weekday.to = result.weekday.from;
      } else if (result.weekend.from === -1 || result.weekend.from === row) {
        // weekend starts on next row
        result.weekend.from = row + 1;
        result.weekend.to = result.weekend.from;
      } else {
        // 3rd metadata not expected
        break;
      }
      continue;
    }

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
    if (result.weekend.from - result.weekday.to > 3) { // there has to be at least 3 rows between weekend and weekday block as 2 rows are occupied by metadata and day name
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

const rowMetadataNames = ['Od', 'Do', 'Událost', 'Kdo', 'Pásmo', 'Pozn'];

// finds metadata in this format: Od Do Událost
function isMetadataRow_ (values, dayWidth, maxNumberOfDaysPerRow) {
  dayLoop:
    for (let day = 0; day < maxNumberOfDaysPerRow; day++) {
      try {
        const columnStart = day * dayWidth;

        let metadataNamesFound = 0;

        for (let columnIdx = columnStart; columnIdx < columnStart + dayWidth; columnIdx++) {
          if (columnIdx >= values.length) {
            break dayLoop;
          }
          const value = values[columnIdx];
          const expectedMetadataName = rowMetadataNames[columnIdx - columnStart];
          if (value === expectedMetadataName) {
            metadataNamesFound += 1;
          }
          // find at least 3 occurrences of metadata in a day to classify it as a metadata row
          if (metadataNamesFound >= 3) {
            return true;
          }
        }
      } catch (err) {
        logError('isMetadataRow_: ' + err);
      }
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
