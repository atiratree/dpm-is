import { ensureString, extractSpreadsheetData, isDayRowByValidation_ } from "./Utils-bundle"
import { Sheet, TestValidation, TTime } from "./sheet_mock"


const dayWidth = 6;
const emptyDaysForRow = (days) => Array(days * dayWidth).fill("");
const ensureValidDayColumn = (day, isWeekend = false) => day % (isWeekend ? 2 : 5);
const dayColumnToDayIdx = (dayColumn, isWeekend = false) => dayColumn + (isWeekend ? 5 : 0);
const timeStrToIntVal = (time) => parseInt(TTime(time).split(";")[0], 10);

test('extractSpreadsheetData with Data', () => {
  const record1Shift = ensureValidDayColumn(4);
  const record2Shift = ensureValidDayColumn(1);
  const record3Shift = ensureValidDayColumn(1);
  const record4Shift = ensureValidDayColumn(0, true);
  const record5Shift = ensureValidDayColumn(1, true);

  const note1Shift = ensureValidDayColumn(2);
  const note2Shift = ensureValidDayColumn(1, true);

  const sheet = (new Sheet())
    .addHeader()
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

    .addHeader(true) // weekend
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
  // weekday
  expect(result.weekday.valid).toBe(true);
  expect(result.weekday.from).toBeGreaterThan(1);
  expect(result.weekday.to).toBeGreaterThan(result.weekday.from);
  expect(result.weekday.length).toStrictEqual(result.weekday.to - result.weekday.from + 1);
  // weekend
  expect(result.weekend.valid).toBe(true);
  expect(result.weekend.from).toBeGreaterThan(result.weekday.to + 3);
  expect(result.weekend.to).toBeGreaterThan(result.weekend.from);
  expect(result.weekend.length).toStrictEqual(result.weekend.to - result.weekend.from + 1);
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


test('extractSpreadsheetData with no weekend', () => {
  const record1Shift = ensureValidDayColumn(4);
  const record2Shift = ensureValidDayColumn(0);
  const note1Shift = ensureValidDayColumn(2);

  const sheet = (new Sheet())
    .addHeader()
    .addEmptyRows(3)
    .addEmptyDataRows(4)
    .addEmptyRows(2)
    .addRows([
      [...emptyDaysForRow(record1Shift), TTime("15:30:00"), TTime("17:15:00"), "birthday;L", "KL;L", "X;L", "happy birthday!;;happy birthday!"],
      [],
      [...emptyDaysForRow(record2Shift), TTime("12:30:00"), TTime("13:00:00"), "", "", "", ""],
      [],
    ])
    .addEmptyDataRows(4)
    .addEmptyRows(6)
    .addEmptyDataRows(2)
    .addRow([...emptyDaysForRow(note1Shift), "day", "this", "78", "a", "bottom", "note"])
    .addEmptyRows(3)

  const result = extractSpreadsheetData(sheet);

  expect(result.valid).toBe(false);
  // weekday
  expect(result.weekday.valid).toBe(true);
  expect(result.weekday.from).toBeGreaterThan(1);
  expect(result.weekday.to).toBeGreaterThan(result.weekday.from);
  expect(result.weekday.length).toStrictEqual(result.weekday.to - result.weekday.from + 1);
  // weekend
  expect(result.weekend.valid).toBe(false);
  expect(result.weekend.from).toStrictEqual(-1);
  expect(result.weekend.to).toStrictEqual(-1);
  expect(result.weekend.length).toStrictEqual(-1);
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


test('extractSpreadsheetData with no header', () => {
  const record1Shift = ensureValidDayColumn(4);
  const note1Shift = ensureValidDayColumn(2);

  const sheet = (new Sheet())
    .addEmptyRows(3)
    .addEmptyDataRows(4)
    .addEmptyRows(2)
    .addRows([
      [...emptyDaysForRow(record1Shift), TTime("15:30:00"), TTime("17:15:00"), "birthday;L", "KL;L", "X;L", "happy birthday!;;happy birthday!"],
      [],
    ])
    .addEmptyDataRows(4)
    .addEmptyRows(6)
    .addEmptyDataRows(2)
    .addRow([...emptyDaysForRow(note1Shift), "day", "this", "78", "a", "bottom", "note"])
    .addEmptyRows(3)

  const result = extractSpreadsheetData(sheet);

  expect(result.valid).toBe(false);
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
  // notes
  expect(result.notes).toHaveLength(0);
  // data
  expect(result.data).toHaveLength(0);
});


test.each([
  [new Sheet().addEmptyRows(1)],
  [new Sheet().addEmptyRows(1000)],
  [new Sheet().addEmptyDataRows(100)],
  [new Sheet().addEmptyDataRows(3).addEmptyDataRows(100).addEmptyDataRows(3)],
  // with text
  [(new Sheet())
    .addEmptyDataRows(20)
    .addRow("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.".split(" "))
    .addRow("Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.".split(" "))
    .addRow("Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.".split(" "))
  ],
  // with missing header
  [(new Sheet())
    .addEmptyRows(3)
    .addEmptyDataRows(4)
    .addEmptyRows(2)
    .addRows([
      [...emptyDaysForRow(ensureValidDayColumn(4)), TTime("15:30:00"), TTime("17:15:00"), "birthday;L", "KL;L", "X;L", "happy birthday!;;happy birthday!"],
      [],
    ])
    .addEmptyDataRows(4)
    .addEmptyRows(6)
    .addEmptyDataRows(2)
    .addRow([...emptyDaysForRow(ensureValidDayColumn(2)), "day", "this", "78", "a", "bottom", "note"])
    .addEmptyRows(3)
  ]
])('extractSpreadsheetData should not extract data on empty or invalid sheet', (sheet) => {
  const result = extractSpreadsheetData(sheet);

  expect(result.valid).toBe(false);
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
  // notes
  expect(result.notes).toHaveLength(0);
  // data
  expect(result.data).toHaveLength(0);
});



test('extractSpreadsheetData with max empty rows for days and weekends', () => {
  const note1Shift = ensureValidDayColumn(2);
  const note2Shift = ensureValidDayColumn(1, true);

  const sheet = (new Sheet())
    .addEmptyRows(3)
    .addHeader()
    .addEmptyDataRows(150)
    .addRow([...emptyDaysForRow(note1Shift), "day", "this", "78", "a", "bottom", "note"])
    .addEmptyRows(2)
    .addHeader(true) // weekend
    .addEmptyDataRows(150)
    .addRow([...emptyDaysForRow(note2Shift), "day", "this", "a", "weekend", "bottom", "note"])
    .addEmptyRows(100)

  const result = extractSpreadsheetData(sheet);


  expect(result.valid).toBe(true);
  // weekday
  expect(result.weekday.valid).toBe(true);
  expect(result.weekday.from).toStrictEqual(5);
  expect(result.weekday.to).toStrictEqual(154);
  expect(result.weekday.length).toStrictEqual(150);
  // weekend
  expect(result.weekend.valid).toBe(true);
  expect(result.weekend.from).toStrictEqual(159);
  expect(result.weekend.to).toStrictEqual(308);
  expect(result.weekend.length).toStrictEqual(150);
  // notes
  expect(result.notes).toHaveLength(2);
  expect(result.notes[0].dayInWeekIdx).toEqual(note1Shift);
  expect(result.notes[0].values).toEqual(["day", "this", "78", "a", "bottom", "note"]);
  expect(result.notes[1].dayInWeekIdx).toEqual(dayColumnToDayIdx(note2Shift, true));
  expect(result.notes[1].values).toEqual(["day", "this", "a", "weekend", "bottom", "note"]);
  // data
  expect(result.data).toHaveLength(0)
});

