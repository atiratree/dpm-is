import {
  asNotesData,
  asDayData,
  detectNotesWithData_,
  detectDaysWithData_,
  isMetadataRow_,
  isDayRowByValidation_,
  isDayRowByBackground_,
} from "./Utils-bundle"

import {
  TestValidation
} from "./sheet_mock"

const fullDayNotesRow = ["day", "this", 78, "a", "bottom", "note"];
const expectedFullDayNotesRow = ["day", "this", "78", "a", "bottom", "note"];
const sparseDayNotesRow = ["", "", "", "", "", "note"];
const emptyDayRow = ["", "", "", "", "", ""];


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

test('detectDaysWithData_', () => {
  expect(detectDaysWithData_(
    [...emptyDayRow, ...fullDayNotesRow, ...emptyDayRow, ...sparseDayNotesRow, ...sparseDayNotesRow, ...emptyDayRow, ...emptyDayRow, ...fullDayNotesRow],
    [...emptyDayRow, ...fullDayNotesRow, ...emptyDayRow, ...sparseDayNotesRow, ...sparseDayNotesRow, ...emptyDayRow, ...emptyDayRow, ...fullDayNotesRow],

    6, 7
  )).toEqual([]);

  expect(detectDaysWithData_(
    [...fullDayNotesRow, ...dataRow, ...emptyDayRow, ...sparseDayNotesRow, ...dataRow],
    [...fullDayNotesRow, ...displayDataRow, ...emptyDayRow, ...sparseDayNotesRow, ...displayDataRow],
    6, 5
  )).toEqual([1, 4]);

  expect(detectDaysWithData_(
    [...fullDayNotesRow, ...dataRow, ...emptyDayRow],
    [...fullDayNotesRow, ...displayDataRow, ...emptyDayRow],
    6, 5
  )).toEqual([1]);

  expect(detectDaysWithData_(null, null, 190, 1789
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
  [undefined, 6, 5, false],
  [[], 6, 5, false],
  [emptyDayRow, 6, 5, false],
  [fullDayNotesRow, 6, 5, false],
  [sparseDayNotesRow, 6, 5, false],
  [dataRow, 6, 5, false],
  [[...emptyDayRow, ...dataRow, ...sparseDayNotesRow, ...fullDayNotesRow], 6, 5, false],

  [['Od', 'Do', '', '', '', ''], 6, 5, false],
  [[...fullDayNotesRow, '', '', '', '', 'Pásmo', 'Pozn'], 6, 5, false],
  [[...fullDayNotesRow, '', '', '', 'Pásmo'], 6, 5, false],

  [['Od', 'Do', 'Událost', 'Kdo', 'Pásmo', 'Pozn'], 6, 5, true],
  [['', 'Do', '', 'Kdo', '', 'Pozn'], 6, 5, true],
  [[...emptyDayRow, 'Od', '', '', '', '', 'Pozn', ...emptyDayRow, '', 'Do', 'Událost', '', '', 'Pozn', ...sparseDayNotesRow], 6, 5, true],
])('isMetadataRow_', (values, dayInWeekIdx, dayWidth, expected) => {
  expect(isMetadataRow_(values, dayInWeekIdx, dayWidth)).toEqual(expected);
});

test.each([
  [undefined, undefined,  false],
  [undefined, "#0aeeff", false],
  [[], undefined, false],
  [[], "#0aeeff", false],
  [["#ffffff", "#0aeeff"], "#0aeeff", false],
  [["#0aeeff", "#0aeeff"], undefined, false],
  [["#0aeeff", "#0aeeff"], "#0aeeff", true],
])('isDayRowByBackground_', (backgrounds, rowColor,  expected) => {
  expect(isDayRowByBackground_(backgrounds, rowColor)).toEqual(expected);
});


test.each([
  [undefined,  false],
  [[], false],
  [[null, new TestValidation("L"), null, null,null, null], false],
  [[null, null, new TestValidation("L"), new TestValidation("L"), new TestValidation("L"), null], true],
  [[null, null, null, new TestValidation("L")], true],
])('isDayRowByValidation_', (validations,  expected) => {
  expect(isDayRowByValidation_(validations)).toEqual(expected);
});


