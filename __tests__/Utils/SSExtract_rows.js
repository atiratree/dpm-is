import {
  asDayData,
  asNotesData,
  detectDaysWithData_,
  detectNotesWithData_,
  isDayRowByBackground_,
  isDayRowByValidation_,
  isMetadataRow_,
} from "./Utils-bundle"

import {TestValidation} from "./sheet_mock"

const fullDayNotesRow = ["day", "this", 78, "a", "bottom", "note"];
const expectedFullDayNotesRow = ["day", "this", "78", "a", "bottom", "note"];
const sparseDayNotesRow = ["", "", "", "", "", "note"];
const emptyDayRow = ["", "", "", "", "", ""];
const dayRow = (a = "", b = "", c = "", d = "", e = "", f = "") => [a, b, c, d, e, f]


const fromDate = new Date(0);
const toDate = new Date(0);

fromDate.setHours(15);
fromDate.setMinutes(30);
fromDate.setSeconds(28);

toDate.setHours(16);
toDate.setMinutes(15);
toDate.setSeconds(0);


const dataRow = [fromDate.getTime(), toDate.getTime(), "birthday", "KL", "X", "happy birthday!"];
const displayDataRow = ["15:30:28", "16:15:00", "birthday", "KL", "X", "happy birthday!"];
const displayDataRowWithWrongFormat = ["52228000", "54900000", "birthday", "KL", "X", "happy birthday!"];

const dataRowReverse = [toDate.getTime(), fromDate.getTime(), "birthday", "KL", "X", "happy birthday!"];
const displayDataRowReverse = ["16:15:00", "15:30:28", "birthday", "KL", "X", "happy birthday!"];

test.each([
  [undefined, 0, 6, {
    dayInWeekIdx: 0,
    values: []
  }],
  [[], 0, 6, {
    dayInWeekIdx: 0,
    values: []
  }],
  [fullDayNotesRow, 0, 6, {
    dayInWeekIdx: 0,
    values: expectedFullDayNotesRow
  }],
  [[...emptyDayRow, ...fullDayNotesRow, ...emptyDayRow, ...emptyDayRow], 1, 6, {
    dayInWeekIdx: 1,
    values: expectedFullDayNotesRow
  }],
  [[...emptyDayRow, ...emptyDayRow, ...emptyDayRow, ...fullDayNotesRow], 3, 6, {
    dayInWeekIdx: 3,
    values: expectedFullDayNotesRow
  }],
  [[...sparseDayNotesRow, ...emptyDayRow, ...emptyDayRow, ...fullDayNotesRow], 3, 6, {
    dayInWeekIdx: 3,
    values: expectedFullDayNotesRow
  }],
  [[...emptyDayRow, ...emptyDayRow, ...sparseDayNotesRow, ...emptyDayRow], 2, 6, {
    dayInWeekIdx: 2,
    values: sparseDayNotesRow
  }],
  [[...emptyDayRow, ...emptyDayRow, ...sparseDayNotesRow, ...emptyDayRow], 4, 4, {
    dayInWeekIdx: 4,
    values: ["", "note", "", ""]
  }],
])('asNotesData', (notesRow, dayInWeekIdx, dayWidth, expected) => {
  expect(asNotesData(notesRow, dayInWeekIdx, dayWidth)).toEqual(expected);
});

test('detectNotesWithData_', () => {
  expect(detectNotesWithData_(
    [...emptyDayRow, ...fullDayNotesRow, ...emptyDayRow, ...sparseDayNotesRow, ...sparseDayNotesRow, ...emptyDayRow, ...emptyDayRow, ...fullDayNotesRow],
    6, 7
  )).toEqual([1, 3, 4]);

  expect(detectNotesWithData_(
    ["", 0, "", "", "", null],
    3, 2
  )).toEqual([0]);
  expect(detectNotesWithData_(null, 190, 1789
  )).toEqual([]);
});

test.each([
  ["DEFAULT_STRATEGY"],
  ["LEGACY_STRATEGY"],
])('detectDaysWithData_', (strategy) => {
  expect(detectDaysWithData_(
    strategy,
    [...emptyDayRow, ...fullDayNotesRow, ...emptyDayRow, ...sparseDayNotesRow, ...sparseDayNotesRow, ...emptyDayRow, ...emptyDayRow, ...fullDayNotesRow],
    [...emptyDayRow, ...fullDayNotesRow, ...emptyDayRow, ...sparseDayNotesRow, ...sparseDayNotesRow, ...emptyDayRow, ...emptyDayRow, ...fullDayNotesRow],

    6, 7
  )).toEqual([]);

  expect(detectDaysWithData_(
    strategy,
    [...fullDayNotesRow, ...dataRow, ...emptyDayRow, ...sparseDayNotesRow, ...dataRow],
    [...fullDayNotesRow, ...displayDataRow, ...emptyDayRow, ...sparseDayNotesRow, ...displayDataRow],
    6, 5
  )).toEqual([1, 4]);


  expect(detectDaysWithData_(
    strategy,
    [...fullDayNotesRow, ...dataRowReverse, ...emptyDayRow, ...sparseDayNotesRow, ...dataRow],
    [...fullDayNotesRow, ...displayDataRowReverse, ...emptyDayRow, ...sparseDayNotesRow, ...displayDataRow],
    6, 5
  )).toEqual([4]);

  let expectedDays = [4]
  if (strategy === "LEGACY_STRATEGY") {
    expectedDays = [1, 4]
  }
  expect(detectDaysWithData_(
    strategy,
    [...fullDayNotesRow, ...dataRow, ...emptyDayRow, ...sparseDayNotesRow, ...dataRow],
    [...fullDayNotesRow, ...displayDataRowWithWrongFormat, ...emptyDayRow, ...sparseDayNotesRow, ...displayDataRow],
    6, 5
  )).toEqual(expectedDays);

  expect(detectDaysWithData_(
    strategy,
    [...fullDayNotesRow, ...dataRow, ...emptyDayRow],
    [...fullDayNotesRow, ...displayDataRow, ...emptyDayRow],
    6, 5
  )).toEqual([1]);

  expect(detectDaysWithData_(
    strategy, null, null, 190, 1789
  )).toEqual([]);
});


test.each([
  {
    testName: "no data",
    valuesRow: undefined,
    displayValuesRow: undefined,
    dayInWeekIdx: 1,
    expected: {
      dayInWeekIdx: 1,
      employee: "",
      event: "",
      from: "",
      note: "",
      tariff: "",
      to: "",
    },
    noDatesExpected: true
  },
  {
    testName: "invalid row data still recorded, but without times",
    valuesRow: fullDayNotesRow,
    displayValuesRow: fullDayNotesRow,
    dayInWeekIdx: 0,
    expected: {
      dayInWeekIdx: 0,
      from: "day",
      to: "this",
      event: "78",
      employee: "a",
      tariff: "bottom",
      note: "note",
    },
    noDatesExpected: true
  },
  {
    testName: "valid row data",
    valuesRow: [...emptyDayRow, ...dataRow],
    displayValuesRow: [...emptyDayRow, ...displayDataRow],
    dayInWeekIdx: 1,
    expected: {
      dayInWeekIdx: 1,
      from: "15:30:28",
      to: "16:15:00",
      duration: 2672000,
      event: "birthday",
      employee: "KL",
      tariff: "X",
      note: "happy birthday!",
    }
  },
])('$testName asDayData', ({
                             valuesRow,
                             displayValuesRow,
                             dayInWeekIdx,
                             expected,
                             noDatesExpected
                           }) => {
  const result = asDayData(valuesRow, displayValuesRow, dayInWeekIdx, 6);
  if (noDatesExpected) {
    expect(result.fromDate.getTime()).toBeNaN()
    expect(result.toDate.getTime()).toBeNaN()
    expect(result.duration).toBeNaN()
    delete result.duration;
  } else {
    expect(result.fromDate.toString()).toContain(expected.from);
    expect(result.toDate.toString()).toContain(expected.to);
  }

  delete result.fromDate;
  delete result.toDate;
  expect(result).toEqual(expected);
});

test.each([
  // test no/empty/irrelevant data
  [undefined, undefined, 6, 5, 2, false],
  [[], undefined, 6, 5, 2, false],
  [undefined, [], 6, 5, 2, false],
  [[], [], 6, 5, 2, false],
  [emptyDayRow, [], 6, 5, 2, false],
  [fullDayNotesRow, [], 6, 5, 2, false],
  [sparseDayNotesRow, sparseDayNotesRow, 6, 5, 2, false],
  [dataRow, dataRow, 6, 5, 2, false],
  [dataRow, sparseDayNotesRow, 6, 5, 2, false],
  [[...emptyDayRow, ...dataRow, ...sparseDayNotesRow, ...fullDayNotesRow], [], 6, 5, 2, false],
  [[...emptyDayRow, ...dataRow, ...sparseDayNotesRow, ...fullDayNotesRow], [...emptyDayRow, ...dataRow, ...sparseDayNotesRow, ...fullDayNotesRow], 6, 5, 2, false],
  [[], [...emptyDayRow, ...dataRow, ...sparseDayNotesRow, ...fullDayNotesRow], 6, 5, 2, false],

  // mixed incomplete data
  [['Od', 'Do', '', '', '', ''], [], 6, 5, 2, false],
  [['Od', 'Do', '', '', '', ''], ['Pondělí', 'Do', '', '', '', '', 'something Úterý'], 6, 5, 2, false],
  [['Pondělí', 'Do', '', '', '', '', 'something Úterý'], ['Od', 'Do', '', '', '', ''], 6, 5, 2, false],
  [[...fullDayNotesRow, '', '', '', '', 'Pásmo', 'Pozn'], [], 6, 5, 2, false],
  [[], [...fullDayNotesRow, '', '', '', '', 'Pásmo', 'Pozn'], 6, 5, 2, false],
  [[...fullDayNotesRow, '', '', '', 'Pásmo'], [], 6, 5, 2, false],
  [[...fullDayNotesRow, '', '', '', 'Pásmo'], ['some data', 'Do', '', '', '', '', 'Úterý'], 6, 5, 2, false],
  [['some data', 'Do', '', '', '', '', 'Úterý'], [...fullDayNotesRow, '', '', '', 'Pásmo'], 6, 5, 2, false],

  // valid main row data
  [['Od', 'Do', 'Událost', 'Kdo', 'Pásmo', 'Pozn', 'Od', 'Do', 'Událost', 'Kdo', 'Pásmo', 'Pozn', 'Od', 'Do', 'Událost', 'Kdo', 'Pásmo', 'Pozn'], [], 6, 5, 2, true],
  [['', 'Do', '', 'Kdo', '', 'Pozn', 'Od', 'Do', 'Událost', '', '', '', '', '', 'Událost', '', 'Pásmo', 'Pozn'], [], 6, 5, 2, true],
  //
  // valid day row data
  [[...dayRow('Pondělí'), ...dayRow('Úterý'), ...dayRow('Středa'), ...dayRow('Čtvrtek'), ...dayRow('Pátek')], [], 6, 5, 2, true],
  [[...dayRow('Pondělí 30.5'), ...dayRow('Úterý tada'), ...emptyDayRow, ...emptyDayRow, ...emptyDayRow], [], 6, 5, 2, true],
  //
  // mixed data next row metadata
  [[...dayRow('Pondělí'), ...dayRow('Úterý'), ...dayRow('Středa'), ...dayRow('Čtvrtek'), ...dayRow('Pátek')], ['Od', 'Do', 'Událost', 'Kdo', 'Pásmo', 'Pozn', 'Od', 'Do', 'Událost', 'Kdo', 'Pásmo', 'Pozn', 'Od', 'Do', 'Událost', 'Kdo', 'Pásmo', 'Pozn'], 6, 5, 2, false],
  [[...dayRow('Pondělí'), 'Úterý'], ['', 'Do', '', 'Kdo', '', 'Pozn', 'Od', 'Do', 'Událost', '', '', '', '', '', 'Událost', '', 'Pásmo', 'Pozn'], 6, 5, 2, false],
  //
  // mixed data is metadata row
  [[...dayRow('Pondělí'), 'Úterý'], ['', '', '', '', 'Pásmo', 'Pozn'], 6, 5, 2, true],
  [[...dayRow('Pondělí'), ...dayRow('Úterý'), ...dayRow('Středa'), ...dayRow('Čtvrtek'), ...dayRow('Pátek')], ['Od', '', '', 'Kdo', '', ''], 6, 5, 2, true],
  [['Od', 'Do', 'Událost', 'Kdo', 'Pásmo', 'Pozn', 'Od', 'Do', 'Událost', 'Kdo', 'Pásmo', 'Pozn', 'Od', 'Do', 'Událost', 'Kdo', 'Pásmo', 'Pozn'], [...dayRow('Pondělí'), ...dayRow('Úterý'), ...dayRow('Středa'), ...dayRow('Čtvrtek'), ...dayRow('Pátek')], 6, 5, 2, true], // ignore the next row
  [['Od', 'Do', 'Událost', 'Kdo', 'Pásmo', 'Pozn', 'Od', 'Do', 'Událost', 'Kdo', 'Pásmo', 'Pozn', 'Od', 'Do', 'Událost', 'Kdo', 'Pásmo', 'Pozn'], [...dayRow('test 1'), 'test 2'], 6, 5, 2, true],
  [['Od', 'Do', 'Událost', 'Kdo', 'Pásmo', 'Pozn', 'Od', 'Do', 'Událost', 'Kdo', 'Pásmo', 'Pozn', 'Od', 'Do', 'Událost', 'Kdo', 'Pásmo', 'Pozn'], [...dayRow('Pondělí'), 'Úterý'], 6, 5, 2, true],
])('isMetadataRow_ weekday + weekend', (values, nextRowValues, dayWidth, numberOfDaysPerRow, numberOfDaysPerWeekendRow, expected) => {
  expect(isMetadataRow_(values, nextRowValues, dayWidth, numberOfDaysPerRow, numberOfDaysPerWeekendRow, false)).toEqual(expected);

  const weekendRowValues = !values ? values : values.map((a) => {
    if (typeof a === 'string') {
      return a.replace('Pondělí', 'Sobota').replace('Úterý', 'Neděle');
    }
    return a;
  })
  // test weekend
  expect(isMetadataRow_(weekendRowValues, nextRowValues, dayWidth, numberOfDaysPerRow, numberOfDaysPerWeekendRow, true)).toEqual(expected);
});


test.each([
  // mixed incomplete data
  [['Pondělí', 'Do', '', '', '', '', 'Neděle'], ['Od', 'Do', '', '', '', ''], 6, 5, 2, false, false],
  [['Pondělí', 'Do', '', '', '', '', 'Neděle'], ['Od', 'Do', '', '', '', ''], 6, 5, 2, true, false],

  // incomplete data for weekday x weekend
  [[...emptyDayRow, 'Od', '', '', '', '', 'Pozn', ...emptyDayRow, '', 'Do', 'Událost', '', '', 'Pozn', ...sparseDayNotesRow], [], 6, 5, 2, false, false],
  [[...emptyDayRow, '', 'Do', '', 'Kdo', '', '', 'Od', 'Do', 'Událost', '', '', '', '', '', 'Událost', '', 'Pásmo', 'Pozn', ...sparseDayNotesRow], [], 6, 5, 2, false, false],
  [[...emptyDayRow, '', 'Do', '', '', '', 'Pozn', ...sparseDayNotesRow], [], 6, 5, 2, true, false],

  // valid main row data
  [[...emptyDayRow, 'Od', 'Do', '', '', '', 'Pozn', ...emptyDayRow, '', 'Do', 'Událost', '', '', 'Pozn', '', '', 'Událost', '', 'Pásmo', 'Pozn'], [], 6, 5, 2, false, true],
  [[...emptyDayRow, '', 'Do', 'Událost', '', '', 'Pozn', ...sparseDayNotesRow], [], 6, 5, 2, true, true],

  // valid day row data
  [[...dayRow('Pondělí 30.5'), ...emptyDayRow, ...emptyDayRow, ...emptyDayRow, ...dayRow('Pátek')], [], 6, 5, 2, false, true],
  [[...emptyDayRow, ...emptyDayRow, ...emptyDayRow, ...dayRow('Čtvrtek 30.5'), ...dayRow('Pátek 31.5')], [], 6, 5, 2, false, true],

  // valid mixed data
  [[...emptyDayRow, ...dayRow('Úterý'), ...emptyDayRow, ...emptyDayRow, ...dayRow('Pátek')], ['', '', 'Událost', '', 'Pásmo', 'Pozn', 'Od', 'Do', '', '', '', 'Pozn', ...emptyDayRow, '', 'Do', 'Událost', '', '', 'Pozn', ...sparseDayNotesRow], 6, 5, 2, false, false],
  [[...emptyDayRow, 'Od', '', '', '', 'Pásmo', 'Pozn', '', '', 'Událost', '', 'Pásmo', 'Pozn', '', 'Do', 'Událost', '', '', 'Pozn', ...sparseDayNotesRow], [...emptyDayRow, ...dayRow('Úterý'), ...emptyDayRow, ...emptyDayRow, ...dayRow('Pátek')], 6, 5, 2, false, true],
  [[...dayRow('Sobota'), ...dayRow('Neděle'), ...dayRow('Pátek')], [...emptyDayRow, '', 'Do', 'Událost', '', '', 'Pozn', ...sparseDayNotesRow], 6, 5, 2, true, false],
  [[...dayRow('Sobota'), ...dayRow('Neděle'), ...dayRow('Pátek')], [...emptyDayRow, '', '', 'Událost', '', '', 'Pozn', ...sparseDayNotesRow], 6, 5, 2, true, true],
  [[...emptyDayRow, '', 'Do', 'Událost', '', '', 'Pozn', ...sparseDayNotesRow], [...dayRow('Sobota'), ...dayRow('Neděle'), ...dayRow('Pátek')], 6, 5, 2, true, true],
])('isMetadataRow_ custom input', (values, nextRowValues, dayWidth, numberOfDaysPerRow, numberOfDaysPerWeekendRow, lookForWeekend, expected) => {
  expect(isMetadataRow_(values, nextRowValues, dayWidth, numberOfDaysPerRow, numberOfDaysPerWeekendRow, lookForWeekend)).toEqual(expected);
});

test.each([
  [undefined, undefined, false],
  [undefined, "#0aeeff", false],
  [[], undefined, false],
  [[], "#0aeeff", false],
  [["#ffffff", "#0aeeff"], "#0aeeff", false],
  [["#0aeeff", "#0aeeff"], undefined, false],
  [["#0aeeff", "#0aeeff"], "#0aeeff", true],
])('isDayRowByBackground_', (backgrounds, rowColor, expected) => {
  expect(isDayRowByBackground_(backgrounds, rowColor)).toEqual(expected);
});


test.each([
  [undefined, false],
  [[], false],
  [[null, new TestValidation("L"), null, null, null, null], false],
  [[null, null, new TestValidation("L"), new TestValidation("L"), new TestValidation("L"), null], true],
  [[null, null, null, new TestValidation("L")], true],
])('isDayRowByValidation_', (validations, expected) => {
  expect(isDayRowByValidation_(validations)).toEqual(expected);
});


