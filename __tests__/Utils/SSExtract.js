import {extractSpreadsheetData, extractSpreadsheetDataWithStrategy,} from "./Utils-bundle"
import {Sheet, TTime} from "./sheet_mock"


const dayWidth = 6;
const emptyDaysForRow = (days) => Array(days * dayWidth).fill("");
const ensureValidDayColumn = (day, isWeekend = false) => day % (isWeekend ? 2 : 5);
const dayColumnToDayIdx = (dayColumn, isWeekend = false) => dayColumn + (isWeekend ? 5 : 0);
const timeStrToIntVal = (time) => parseInt(TTime(time).split(";")[0], 10);

test.each([
  [true, false],
  [false, true],
  [true, true],
])('extractSpreadsheetData with Data (DEFAULT_STRATEGY)', (hasDayHeader, hasHeader) => {
  const record1Shift = ensureValidDayColumn(4);
  const record2Shift = ensureValidDayColumn(1);
  const record3Shift = ensureValidDayColumn(1);
  const record4Shift = ensureValidDayColumn(0, true);
  const record5Shift = ensureValidDayColumn(1, true);

  const note1Shift = ensureValidDayColumn(2);
  const note2Shift = ensureValidDayColumn(1, true);

  const sheet = (new Sheet()).addCompleteHeader(hasDayHeader, hasHeader, false, 0)
  const startWeekdayDataRowsShift = sheet.getMaxRows(); // DEFAULT_STRATEGY starts right after header

  sheet
    .addEmptyRows(3)
    .addEmptyDataRows(4)
    .addEmptyRows(2)
    .addRows([
      [...emptyDaysForRow(record1Shift), TTime("15:30:00"), TTime("17:15:00"), "birthday;L", "KL;L", "X;L", "happy birthday!;;happy birthday!"],
      [],
      [TTime("17:40:54"), "invalid", "client 10;L", "LO;L", "T;L", ""],
      ["invalid", TTime("17:40:54"), "client 10;L", "LO;L", "T;L", ""],
      [],
      ["invalid", TTime("17:40:54"), "", "", "T;L", ""],
      [],
      [],
      [...emptyDaysForRow(record2Shift), TTime("17:40:54"), TTime("19:00:00"), "client 5;L", "LO;L", "T;L", ""],
      [...emptyDaysForRow(record3Shift), TTime("18:00:28"), TTime("19:30:00"), "client 4;L", "GG;L", "T;L", ""],

    ])
    .addEmptyDataRows(4)
    .addEmptyRows(6)
    .addEmptyDataRows(2)
    .addRow([...emptyDaysForRow(note1Shift), "day", "this", "78", "a", "bottom", "note"])
    .addEmptyRows(3)

    .addCompleteHeader(hasDayHeader, hasHeader, true, 0) //
  const startWeekendDataRowsShift = sheet.getMaxRows(); // DEFAULT_STRATEGY starts right after header

  sheet
    .addEmptyDataRows(5, true)
    .addRows([
      [...emptyDaysForRow(record4Shift), TTime("04:30:28"), TTime("16:15:00"), "client 3;L", "KL;L", "X;L", "long;;long"],
    ])
    .addEmptyRows(15)
    .addEmptyDataRows(3, true)
    .addRows([
      [...emptyDaysForRow(record5Shift), TTime("07:30:20"), TTime("07:30:30"), "client 3;L", "KL;L", "X;L", "long;;long"],
    ])
    .addRow([...emptyDaysForRow(note2Shift), "day", "this", "a", "weekend", "bottom", "note"])


  const result = extractSpreadsheetData(sheet);

  expect(result.valid).toBe(true);
  expect(result.strategy).toBe("DEFAULT_STRATEGY");
  // weekday
  expect(result.weekday.valid).toBe(true);
  expect(result.weekday.from).toStrictEqual(1 + startWeekdayDataRowsShift);
  expect(result.weekday.to).toStrictEqual(31 + startWeekdayDataRowsShift);
  expect(result.weekday.length).toStrictEqual(result.weekday.to - result.weekday.from + 1);
  // weekend
  expect(result.weekend.valid).toBe(true);
  expect(result.weekend.from).toStrictEqual(1 + startWeekendDataRowsShift);
  expect(result.weekend.to).toStrictEqual(25 + startWeekendDataRowsShift);
  expect(result.weekend.length).toStrictEqual(result.weekend.to - result.weekend.from + 1);
  // last day row
  expect(result.lastDayRow).toStrictEqual(result.weekend.to);
  // notes
  expect(result.notes).toHaveLength(2);
  expect(result.notes[0].dayInWeekIdx).toEqual(note1Shift);
  expect(result.notes[0].values).toEqual(["day", "this", "78", "a", "bottom", "note"]);
  expect(result.notes[1].dayInWeekIdx).toEqual(dayColumnToDayIdx(note2Shift, true));
  expect(result.notes[1].values).toEqual(["day", "this", "a", "weekend", "bottom", "note"]);
  // data
  expect(result.data).toHaveLength(5);
  expect(result.data[0].dayInWeekIdx).toEqual(record1Shift);
  expect(result.data[1].dayInWeekIdx).toEqual(record2Shift);
  expect(result.data[2].dayInWeekIdx).toEqual(record3Shift);
  expect(result.data[3].dayInWeekIdx).toEqual(dayColumnToDayIdx(record4Shift, true));
  expect(result.data[4].dayInWeekIdx).toEqual(dayColumnToDayIdx(record5Shift, true));

  expect(result.data[0]).toEqual({
    from: "15:30:00",
    to: "17:15:00",
    fromDate: new Date(timeStrToIntVal("15:30:00")),
    toDate: new Date(timeStrToIntVal("17:15:00")),
    event: "birthday",
    employee: "KL",
    tariff: "X",
    note: "happy birthday!",
    duration: 105 * 60 * 1000, // 105 minutes
    dayInWeekIdx: 4,
  });

  result.data.forEach(day => {
    expect(day.from).toBeTruthy()
    expect(day.to).toBeTruthy()
    expect(day.fromDate).toBeTruthy()
    expect(day.toDate).toBeTruthy()
    expect(day.event).toBeTruthy()
    expect(day.employee).toBeTruthy()
    expect(day.tariff).toBeTruthy()
    expect(day.duration).toBeGreaterThan(0)
    expect(day.dayInWeekIdx).toBeGreaterThanOrEqual(0)
  })
});


test.each([
  [true, false, 0, 0],
  [false, true, 0, 0],
  [true, true, 0, 0],
  [true, false, 0, 1],
  [true, false, 0, 2],
  [true, false, 0, 5],
  [true, false, 1, 0],
  [false, true, 1, 0],
  [true, true, 1, 0],
  [true, false, 1, 1],
  [true, false, 1, 2],
  [true, false, 1, 5],
  [true, false, 3, 0],
  [false, true, 3, 0],
  [true, true, 3, 0],
  [true, false, 3, 1],
  [true, false, 3, 2],
  [true, false, 3, 5],
])('extractSpreadsheetData with no weekday header (WEEKEND_HEADER_ONLY_STRATEGY)', (hasDayHeader, hasHeader, numberOfEmptyRowsBeforeFirstData, numberOfEmptyRowsAfterWeekendHeader) => {
  const record1Shift = ensureValidDayColumn(4);
  const record2Shift = ensureValidDayColumn(0);
  const note1Shift = ensureValidDayColumn(1, true);

  const sheet = (new Sheet()).addEmptyRows(numberOfEmptyRowsBeforeFirstData)

  const startDataRowsShift = sheet.getMaxRows(); // ignores empty rows due to WEEKEND_HEADER_ONLY_STRATEGY

  sheet
    .addRows([
      [...emptyDaysForRow(record1Shift), TTime("15:30:00"), TTime("17:15:00"), "birthday;L", "KL;L", "X;L", "happy birthday!;;happy birthday!"],
      [],
      [...emptyDaysForRow(record2Shift), TTime("12:30:00"), TTime("13:00:00"), "", "", "", ""],
      [],
    ])
    .addEmptyDataRows(4)
    .addEmptyRows(6)
    .addCompleteHeader(hasDayHeader, hasHeader, true, numberOfEmptyRowsAfterWeekendHeader)

  const startWeekendDataRowsShift = sheet.getMaxRows() - numberOfEmptyRowsAfterWeekendHeader; // WEEKEND_HEADER_ONLY_STRATEGY starts right after weekend header

  sheet
    .addEmptyDataRows(2)
    .addRows([
      [TTime("07:30:20"), TTime("07:30:30"), "client 3;L", "KL;L", "X;L", "long;;long"],
    ])
    .addRow([...emptyDaysForRow(note1Shift), "day", "this", "78", "a", "bottom", "note"])
    .addEmptyRows(3)

  const result = extractSpreadsheetData(sheet);

  expect(result.valid).toBe(true);
  expect(result.strategy).toBe("WEEKEND_HEADER_ONLY_STRATEGY");
  // weekday
  expect(result.weekday.valid).toBe(true);
  expect(result.weekday.from).toStrictEqual(1 + startDataRowsShift);
  expect(result.weekday.to).toStrictEqual(8 + startDataRowsShift);
  expect(result.weekday.length).toStrictEqual(result.weekday.to - result.weekday.from + 1);
  // weekend
  expect(result.weekend.valid).toBe(true);
  expect(result.weekend.from).toStrictEqual(1 + startWeekendDataRowsShift);
  expect(result.weekend.to).toStrictEqual(3 + startWeekendDataRowsShift + numberOfEmptyRowsAfterWeekendHeader); // when we have header we can consider the spaces as well
  expect(result.weekend.length).toStrictEqual(result.weekend.to - result.weekend.from + 1);
  // last day row
  expect(result.lastDayRow).toStrictEqual(result.weekend.to);
  // notes
  expect(result.notes).toHaveLength(1);
  // note
  expect(result.notes[0].values).toEqual(["day", "this", "78", "a", "bottom", "note"]);

  // data
  expect(result.data).toHaveLength(3);
  expect(result.data[0].dayInWeekIdx).toEqual(record1Shift);
  expect(result.data[1].dayInWeekIdx).toEqual(record2Shift);

  // full day
  expect(result.data[0]).toEqual({
    from: "15:30:00",
    to: "17:15:00",
    fromDate: new Date(timeStrToIntVal("15:30:00")),
    toDate: new Date(timeStrToIntVal("17:15:00")),
    event: "birthday",
    employee: "KL",
    tariff: "X",
    note: "happy birthday!",
    duration: 105 * 60 * 1000, // 105 minutes
    dayInWeekIdx: 4,
  });

  // day with times only
  expect(result.data[1]).toEqual({
    from: "12:30:00",
    to: "13:00:00",
    fromDate: new Date(timeStrToIntVal("12:30:00")),
    toDate: new Date(timeStrToIntVal("13:00:00")),
    event: "",
    employee: "",
    tariff: "",
    note: "",
    duration: 30 * 60 * 1000, // 30 minutes
    dayInWeekIdx: 0,
  });
});


test.each([
  [true, false, 0],
  [false, true, 0],
  [true, true, 0],
  [true, false, 1],
  [true, false, 2],
  [true, false, 5],
])('extractSpreadsheetData with no weekend header (LAST_SPACE_BETWEEN_ROWS_STRATEGY)', (hasDayHeader, hasHeader, numberOfEmptyRows) => {
  const record1Shift = ensureValidDayColumn(4);
  const record2Shift = ensureValidDayColumn(0);
  const note1Shift = ensureValidDayColumn(2); // do not find this one

  const sheet = (new Sheet()).addCompleteHeader(hasDayHeader, hasHeader, false, numberOfEmptyRows)

  const startDataRowsShift = sheet.getMaxRows(); // ignores empty rows due to LAST_SPACE_BETWEEN_ROWS_STRATEGY

  sheet
    .addRows([
      [...emptyDaysForRow(record1Shift), TTime("15:30:00"), TTime("17:15:00"), "birthday;L", "KL;L", "X;L", "happy birthday!;;happy birthday!"],
      [],
      [...emptyDaysForRow(record2Shift), TTime("12:30:00"), TTime("13:00:00"), "", "", "", ""],
      [],
    ])
    .addEmptyDataRows(4)
    .addEmptyRows(6)

  const startWeekendDataRowsShift = sheet.getMaxRows(); // LAST_SPACE_BETWEEN_ROWS_STRATEGY  space starts weekend right after

  sheet
    .addEmptyDataRows(2)
    .addRow([...emptyDaysForRow(note1Shift), "day", "this", "78", "a", "bottom", "note"])
    .addEmptyRows(3)

  const result = extractSpreadsheetData(sheet);

  expect(result.valid).toBe(true);
  expect(result.strategy).toBe("LAST_SPACE_BETWEEN_ROWS_STRATEGY");
  // weekday
  expect(result.weekday.valid).toBe(true);
  expect(result.weekday.from).toStrictEqual(1 + startDataRowsShift);
  expect(result.weekday.to).toStrictEqual(8 + startDataRowsShift);
  expect(result.weekday.length).toStrictEqual(result.weekday.to - result.weekday.from + 1);
  // weekend
  expect(result.weekend.valid).toBe(true);
  expect(result.weekend.from).toStrictEqual(1 + startWeekendDataRowsShift);
  expect(result.weekend.to).toStrictEqual(2 + startWeekendDataRowsShift);
  expect(result.weekend.length).toStrictEqual(result.weekend.to - result.weekend.from + 1);
  // last day row
  expect(result.lastDayRow).toStrictEqual(result.weekend.to);
  // notes
  expect(result.notes).toHaveLength(0);
  // data
  expect(result.data).toHaveLength(2);
  expect(result.data[0].dayInWeekIdx).toEqual(record1Shift);
  expect(result.data[1].dayInWeekIdx).toEqual(record2Shift);

  // full day
  expect(result.data[0]).toEqual({
    from: "15:30:00",
    to: "17:15:00",
    fromDate: new Date(timeStrToIntVal("15:30:00")),
    toDate: new Date(timeStrToIntVal("17:15:00")),
    event: "birthday",
    employee: "KL",
    tariff: "X",
    note: "happy birthday!",
    duration: 105 * 60 * 1000, // 105 minutes
    dayInWeekIdx: 4,
  });

  // day with times only
  expect(result.data[1]).toEqual({
    from: "12:30:00",
    to: "13:00:00",
    fromDate: new Date(timeStrToIntVal("12:30:00")),
    toDate: new Date(timeStrToIntVal("13:00:00")),
    event: "",
    employee: "",
    tariff: "",
    note: "",
    duration: 30 * 60 * 1000, // 30 minutes
    dayInWeekIdx: 0,
  });
});


test('extractSpreadsheetData with no header (LAST_SPACE_BETWEEN_ROWS_STRATEGY)', () => {
  const record1Shift = ensureValidDayColumn(4);
  const note1Shift = ensureValidDayColumn(2);
  const note2Shift = ensureValidDayColumn(1, true);

  const sheet = (new Sheet())
    .addEmptyRows(3)
    .addEmptyDataRows(4)
    .addEmptyRows(2)
    .addRows([
      [...emptyDaysForRow(record1Shift), TTime("15:30:00"), TTime("17:15:00"), "birthday;L", "KL;L", "X;L", "happy birthday!;;happy birthday!"],
      [],
    ])
    .addEmptyDataRows(4)
    .addRow([...emptyDaysForRow(note1Shift), "a", "note"])
    .addEmptyRows(6)
    .addEmptyDataRows(2)
    .addRow([...emptyDaysForRow(note2Shift), "day", "this", "78", "a", "bottom", "note"])
    .addEmptyRows(3)

  const result = extractSpreadsheetData(sheet);

  expect(result.valid).toBe(true);
  expect(result.strategy).toBe("LAST_SPACE_BETWEEN_ROWS_STRATEGY");
  // weekday
  expect(result.weekday.valid).toBe(true);
  expect(result.weekday.from).toStrictEqual(4);
  expect(result.weekday.to).toStrictEqual(15);
  expect(result.weekday.length).toStrictEqual(result.weekday.to - result.weekday.from + 1);
  // weekend
  expect(result.weekend.valid).toBe(true);
  expect(result.weekend.from).toStrictEqual(23);
  expect(result.weekend.to).toStrictEqual(24);
  expect(result.weekend.length).toStrictEqual(result.weekend.to - result.weekend.from + 1);
  // last day row
  expect(result.lastDayRow).toStrictEqual(result.weekend.to);
  // notes
  expect(result.notes).toHaveLength(2);
  // data
  expect(result.data).toHaveLength(1);
});


test.each([
  [new Sheet().addEmptyDataRows(1)],
  [new Sheet().addEmptyDataRows(100)],
  [new Sheet().addEmptyRows(1).addEmptyDataRows(1)],
  [new Sheet().addEmptyRows(3).addEmptyDataRows(100)],
  [new Sheet().addEmptyDataRows(100).addEmptyRows(3)],
  // with text
  [(new Sheet())
    .addEmptyRows(4)
    .addRow("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.".split(" "))
    .addRow("Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.".split(" "))
    .addRow("Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.".split(" "))
    .addEmptyDataRows(20)
  ],
])('extractSpreadsheetData should extract weekday data only (LAST_SPACE_BETWEEN_ROWS_STRATEGY)', (sheet) => {
  const result = extractSpreadsheetData(sheet);

  expect(result.valid).toBe(false);
  expect(result.strategy).toBe("LAST_SPACE_BETWEEN_ROWS_STRATEGY");
  // weekday
  expect(result.weekday.valid).toBe(true);
  expect(result.weekday.from).toBeGreaterThan(0);
  expect(result.weekday.to).toBeGreaterThanOrEqual(result.weekday.from);
  expect(result.weekday.length).toStrictEqual(result.weekday.to - result.weekday.from + 1);
  // weekend
  expect(result.weekend.valid).toBe(false);
  expect(result.weekend.from).toStrictEqual(-1);
  expect(result.weekend.to).toStrictEqual(-1);
  expect(result.weekend.length).toStrictEqual(-1);
  // last day row
  expect(result.lastDayRow).toStrictEqual(result.weekday.to);
  // notes
  expect(result.notes).toHaveLength(0);
  // data
  expect(result.data).toHaveLength(0);
});


test.each([
  [new Sheet().addEmptyRows(1)],
  [new Sheet().addEmptyRows(1000)],
  // with text
  [(new Sheet())
    .addEmptyRows(20)
    .addRow("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.".split(" "))
    .addRow("Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.".split(" "))
    .addRow("Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.".split(" "))
  ],
])('extractSpreadsheetData should not extract data on empty or invalid sheet (LAST_SPACE_BETWEEN_ROWS_STRATEGY)', (sheet) => {
  const result = extractSpreadsheetData(sheet);

  expect(result.valid).toBe(false);
  expect(result.strategy).toBe("LAST_SPACE_BETWEEN_ROWS_STRATEGY");
  // weekday
  expect(result.weekday.valid).toBe(false);
  expect(result.weekday.from).toStrictEqual(-1);
  expect(result.weekday.to).toStrictEqual(-1);
  expect(result.weekday.length).toStrictEqual(-1);
  // weekend
  expect(result.weekend.valid).toBe(false);
  expect(result.weekend.from).toStrictEqual(-1);
  expect(result.weekend.to).toStrictEqual(-1);
  expect(result.weekend.length).toStrictEqual(-1);
  // last day row
  expect(result.lastDayRow).toStrictEqual(-1);
  // notes
  expect(result.notes).toHaveLength(0);
  // data
  expect(result.data).toHaveLength(0);
});


test('extractSpreadsheetData with max empty rows for days and weekends and duplicate headers (DEFAULT_STRATEGY)', () => {
  const note1Shift = ensureValidDayColumn(2);
  const note2Shift = ensureValidDayColumn(1, true);

  const sheet = (new Sheet())
    .addEmptyRows(3)
    .addHeader()
    .addDayNameHeader()
    .addHeader()
    .addDayNameHeader()
    .addDayNameHeader()
    .addHeader()
    .addEmptyDataRows(150)
    .addRow([...emptyDaysForRow(note1Shift), "day", "this", "78", "a", "bottom", "note"])
    .addEmptyRows(2)
    .addHeader(true) // weekend
    .addHeader(true) // weekend
    .addDayNameHeader(true) // weekend
    .addDayNameHeader(true) // weekend
    .addHeader(true) // weekend
    .addDayNameHeader(true)
    .addEmptyDataRows(150)
    .addRow([...emptyDaysForRow(note2Shift), "day", "this", "a", "weekend", "bottom", "note"])
    .addEmptyRows(100)

  const result = extractSpreadsheetData(sheet);


  expect(result.valid).toBe(true);
  expect(result.strategy).toBe("DEFAULT_STRATEGY");
  // weekday
  expect(result.weekday.valid).toBe(true);
  expect(result.weekday.from).toStrictEqual(10);
  expect(result.weekday.to).toStrictEqual(159);
  expect(result.weekday.length).toStrictEqual(150);
  // weekend
  expect(result.weekend.valid).toBe(true);
  expect(result.weekend.from).toStrictEqual(169);
  expect(result.weekend.to).toStrictEqual(318);
  expect(result.weekend.length).toStrictEqual(150);
  // last day row
  expect(result.lastDayRow).toStrictEqual(result.weekend.to);
  // notes
  expect(result.notes).toHaveLength(2);
  expect(result.notes[0].dayInWeekIdx).toEqual(note1Shift);
  expect(result.notes[0].values).toEqual(["day", "this", "78", "a", "bottom", "note"]);
  expect(result.notes[1].dayInWeekIdx).toEqual(dayColumnToDayIdx(note2Shift, true));
  expect(result.notes[1].values).toEqual(["day", "this", "a", "weekend", "bottom", "note"]);
  // data
  expect(result.data).toHaveLength(0)
});


test('extractSpreadsheetData with reversed headers recognize it is not default strategy even if valid (WEEKEND_HEADER_ONLY_STRATEGY)', () => {
  const note1Shift = ensureValidDayColumn(2);
  const note2Shift = ensureValidDayColumn(1, true);

  const sheet = (new Sheet())
    .addEmptyRows(3)
    .addCompleteHeader(true, true, true)
    .addEmptyDataRows(10)
    .addRow([...emptyDaysForRow(note1Shift), "day", "this", "78", "a", "bottom", "note"])
    .addEmptyRows(2)
    .addCompleteHeader(true, true, false)
    .addEmptyDataRows(150)
    .addRow([...emptyDaysForRow(note2Shift), "day", "this", "a", "weekend", "bottom", "note"])
    .addEmptyRows(100)

  const result = extractSpreadsheetData(sheet);

  expect(result.valid).toBe(true);
  expect(result.strategy).toBe("WEEKEND_HEADER_ONLY_STRATEGY");
});


test('extractSpreadsheetData with reversed only day headers recognize it is not default strategy even if valid  (LAST_SPACE_BETWEEN_ROWS_STRATEGY)', () => {
  const note1Shift = ensureValidDayColumn(2);
  const note2Shift = ensureValidDayColumn(1, true);

  const sheet = (new Sheet())
    .addEmptyRows(3)
    .addCompleteHeader(true, false, true, 0)
    .addEmptyDataRows(10)
    .addRow([...emptyDaysForRow(note1Shift), "day", "this", "78", "a", "bottom", "note"])
    .addEmptyRows(2)
    .addCompleteHeader(true, false, false, 0)
    .addEmptyDataRows(150)
    .addRow([...emptyDaysForRow(note2Shift), "day", "this", "a", "weekend", "bottom", "note"])
    .addEmptyRows(100)

  const result = extractSpreadsheetData(sheet);

  expect(result.valid).toBe(true);
  expect(result.strategy).toBe("LAST_SPACE_BETWEEN_ROWS_STRATEGY");
});


test('recognize notes squised between data (LAST_SPACE_BETWEEN_ROWS_STRATEGY)', () => {
  const note1Shift = ensureValidDayColumn(2);
  const note2Shift = ensureValidDayColumn(1, true);

  const sheet = (new Sheet())
    .addEmptyRows(3)
    .addEmptyDataRows(10)
    .addRow([...emptyDaysForRow(note1Shift), "day", "this", "78", "a", "bottom", "note"])
    .addEmptyDataRows(150)
    .addRow([...emptyDaysForRow(note2Shift), "day", "this", "a", "weekend", "bottom", "note"])
    .addEmptyRows(100)

  const result = extractSpreadsheetData(sheet);

  expect(result.valid).toBe(true);
  expect(result.strategy).toBe("LAST_SPACE_BETWEEN_ROWS_STRATEGY");

  // notes
  expect(result.notes).toHaveLength(2);
  expect(result.notes[0].dayInWeekIdx).toEqual(note1Shift);
  expect(result.notes[0].values).toEqual(["day", "this", "78", "a", "bottom", "note"]);
  expect(result.notes[1].dayInWeekIdx).toEqual(dayColumnToDayIdx(note2Shift, true));
  expect(result.notes[1].values).toEqual(["day", "this", "a", "weekend", "bottom", "note"]);
  // data
  expect(result.data).toHaveLength(0)
});


test.each([
  ["LEGACY_STRATEGY", {}],
  ["DEFAULT_STRATEGY", {}],
  ["WEEKEND_HEADER_ONLY_STRATEGY", {}],
  ["LAST_SPACE_BETWEEN_ROWS_STRATEGY", {lastDayRow: 56}],
])('extractSpreadsheetDataWithStrategy every strategy should return same results for well formed document', (strategy, strategyOpts) => {
  const sheet = (new Sheet())
    .addRow(["Rozpis služeb tým Tým X", "", "", "", "", "", "týden č. 10", "", "", "", "", "2020"])
    .addEmptyRows(1)
    .addDayNameHeader(false)
    .addHeader(false)
    .addRow([...emptyDaysForRow(1), TTime("15:30:00"), TTime("17:15:00"), "birthday;L", "KL;L", "X;L", "happy birthday!;;happy birthday!"])
    .addEmptyRows(10)
    .addRow([...emptyDaysForRow(4), TTime("17:40:54"), TTime("19:00:00"), "client 5;L", "LO;L", "T;L", ""])
    .addEmptyRows(15)
    .addRow([TTime("18:00:28"), TTime("19:30:00"), "client 4;L", "GG;L", "T;L", ""])
    .addRow(["day", "this", "78", "a", "bottom", "note"])
    .addEmptyRows(1)
    .addDayNameHeader(true)
    .addHeader(true)
    .addRow([...emptyDaysForRow(1), TTime("13:40:50"), TTime("17:00:00"), "client 6;L", "LO;L", "T;L", ""])
    .addEmptyRows(7)
    .addRow([TTime("18:40:54"), TTime("20:00:00"), "client 7;L", "K:;L", "T;L", ""])
    .addEmptyRows(10)
    .addRow([TTime("11:00:00"), TTime("12:00:00"), "client 8;L", "JJ;L", "Q;L", ""])
    .addRow(["day", "this", "a", "weekend", "bottom", "note"])
    .addEmptyRows(50)


  const result = extractSpreadsheetDataWithStrategy(sheet, strategy, strategyOpts);

  expect(result.valid).toBe(true);
  expect(result.weekday.valid).toBe(true);
  expect(result.weekend.valid).toBe(true);
  expect(result.strategy).toBe(strategy);

  if (strategy !== "LAST_SPACE_BETWEEN_ROWS_STRATEGY") {
    // does not test the rest for LAST_SPACE_BETWEEN_ROWS_STRATEGY heurestic as it will be incorrect

    // weekday
    expect(result.weekday.from).toStrictEqual(5);
    expect(result.weekday.to).toStrictEqual(32);
    expect(result.weekday.length).toStrictEqual(28);
    // weekend
    expect(result.weekend.from).toStrictEqual(37);
    expect(result.weekend.to).toStrictEqual(56);
    expect(result.weekend.length).toStrictEqual(20);
    // last day row
    expect(result.lastDayRow).toStrictEqual(56);
    // notes
    expect(result.notes).toHaveLength(2);
    expect(result.notes[0].dayInWeekIdx).toEqual(0);
    expect(result.notes[0].values).toEqual(["day", "this", "78", "a", "bottom", "note"]);
    expect(result.notes[1].dayInWeekIdx).toEqual(dayColumnToDayIdx(0, true));
    expect(result.notes[1].values).toEqual(["day", "this", "a", "weekend", "bottom", "note"]);
    // data
    expect(result.data).toHaveLength(6);
    expect(result.data[0].dayInWeekIdx).toEqual(1);
    expect(result.data[1].dayInWeekIdx).toEqual(4);
    expect(result.data[2].dayInWeekIdx).toEqual(0);
    expect(result.data[3].dayInWeekIdx).toEqual(dayColumnToDayIdx(1, true));
    expect(result.data[4].dayInWeekIdx).toEqual(dayColumnToDayIdx(0, true));
    expect(result.data[5].dayInWeekIdx).toEqual(dayColumnToDayIdx(0, true));
  }


  expect(result.data[0]).toEqual({
    from: "15:30:00",
    to: "17:15:00",
    fromDate: new Date(timeStrToIntVal("15:30:00")),
    toDate: new Date(timeStrToIntVal("17:15:00")),
    event: "birthday",
    employee: "KL",
    tariff: "X",
    note: "happy birthday!",
    duration: 105 * 60 * 1000, // 105 minutes
    dayInWeekIdx: 1,
  });

  result.data.forEach(day => {
    expect(day.from).toBeTruthy()
    expect(day.to).toBeTruthy()
    expect(day.fromDate).toBeTruthy()
    expect(day.toDate).toBeTruthy()
    expect(day.event).toBeTruthy()
    expect(day.employee).toBeTruthy()
    expect(day.tariff).toBeTruthy()
    expect(day.duration).toBeGreaterThan(0)
    expect(day.dayInWeekIdx).toBeGreaterThanOrEqual(0)
  })
});