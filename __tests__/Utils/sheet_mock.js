import { SpreadsheetApp } from './mocks'

export class TestValidation {
  constructor(typeShortcut) {
    this.type = null;
    if (typeShortcut === "L") {
      this.type = SpreadsheetApp.DataValidationCriteria.VALUE_IN_LIST;
    }
  }
  getCriteriaType() {
    return this.type
  }
}

export const TTime = (time = "", color = '#fff2cc') => {
  const parts = time.split(":");

  let value = "", d = null;
  if (parts.length === 3) {
    const d = new Date(0);
    d.setHours(parts[0]);
    d.setMinutes(parts[1]);
    d.setSeconds(parts[2]);
    if (!isNaN(d.getTime())) {
      value = d.getTime() + "";
    }
  }

  if (time !== "" && value === "") {
    throw "invalid time";
  }

  return `${value};;${time};${color}`
}


export class Sheet {
  constructor(data) {
    this.data = data || [];
  }

  // implementation

  getMaxRows() {
    return this.data.length;
  }
  getLastRow() {
    for (let rowIdx = this.data.length - 1; rowIdx >= 0; rowIdx--) {
      const row = this.data[rowIdx];
      for (let colIdx = 0; colIdx < row.length; colIdx++) {
        const value = row[colIdx];
        if (value !== "") {
          return rowIdx + 1;
        }
      }
    }
    return 1;
  }
  getRange(row, column, numRows, numColumns) {
    if (row < 1 || column < 1 || numRows < 1 | numColumns < 1) {
      throw "invalid arguments";
    }

    const newData = [];

    const fromRow = row - 1;
    const fromCol = column - 1;

    for (let rowIdx = fromRow; rowIdx < fromRow + numRows; rowIdx++) {
      const rowData = this.data[rowIdx];
      const newRow = []
      for (let colIdx = fromCol; colIdx < fromCol + numColumns; colIdx++) {
        const value = (rowData[colIdx] || "");
        newRow.push(value);
      }
      newData.push(newRow);
    }

    // originally Range type is returned, but this is good for test purposes
    return new Sheet(newData)
  }

  getValues() {
    return this.splitAccordingly(0, (x) => {
      const res = parseInt(x, 10)
      if (isNaN(res) || res + "" !== x) {
        return x;
      }

      return res;
    })
  }

  getDataValidations() {
    return this.splitAccordingly(1, (x) => {
      if (x === "") {
        return null;
      }
      return new TestValidation(x);
    })
  }

  getDisplayValues() {
    return this.splitAccordingly(2);
  }

  getBackgrounds() {
    return this.splitAccordingly(3);
  }

  // format value;validations;displayValue;backgroundColor
  //        2672000;L;15:30:28;#e2f3ff
  splitAccordingly(idx, valueModifier = (x) => x, delimiter = ";") {
    const result = [];
    for (let rowIdx = 0; rowIdx < this.data.length; rowIdx++) {
      const row = this.data[rowIdx];
      const resultRow = [];
      for (let colIdx = 0; colIdx < row.length; colIdx++) {
        const valueAndMetadata = (row[colIdx] || "").split(delimiter);

        resultRow.push(valueModifier(idx < valueAndMetadata.length ? valueAndMetadata[idx] : ""));
      }
      result.push(resultRow);
    }
    return result;
  }

  // test utility functions

  addHeader(isWeekend = false) {
    const days = isWeekend ? 2 : 5;
    const header = [];
    for (let day = 0; day < days; day++) {
      header.push('Od', 'Do', 'Událost', 'Kdo', 'Pásmo', 'Pozn');
    }
    this.data.push(header);
    return this;
  }


  addDayNameHeader(isWeekend = false) {
    const rowMetadataDayNames = ['Pondělí 10.2', 'Úterý 11.2', 'Středa 12.2', 'Čtvrtek 13.2', 'Pátek 14.2', 'Sobota 15.2', 'Neděle 16.2'];
    const days = isWeekend ? 2 : 5;
    const dayNamesStartIdx = isWeekend ? 5 : 0;
    const header = [];
    for (let day = 0; day < days; day++) {
      header.push(rowMetadataDayNames[dayNamesStartIdx + day], '', '', '', '', '');
    }
    this.data.push(header);
    return this;
  }

  addCompleteHeader(hasDayHeader, hasHeader, isWeekend = false, numberOfEmptyRows = 1) {
    if (hasDayHeader) {
      this.addDayNameHeader(isWeekend)
    }
    if (hasHeader) {
      this.addHeader(isWeekend)
    } else {
      this.addEmptyRows(numberOfEmptyRows)
    }
    return this
  }


  addEmptyRows(numOfRows) {
    for (let newRow = 0; newRow < numOfRows; newRow++) {
      this.data.push([]);
    }
    return this;
  }

  addEmptyDataRows(numOfRows, isWeekend = false) {
    const days = isWeekend ? 2 : 5;
    for (let newRow = 0; newRow < numOfRows; newRow++) {
      const newRow = [];

      for (let day = 0; day < days; day++) {
        newRow.push(TTime(), TTime(), ';L', ';L', ';L', '');
      }
      this.data.push(newRow);
    }
    return this;
  }

  addRow(row) {
    this.data.push(row)
    return this;
  }


  addRows(data) {
    this.data.push(...data)
    return this;
  }

  withMinCols(mincols) {
    for (let rowIdx = 0; rowIdx < this.data.length; rowIdx++) {
      const row = this.data[rowIdx];
      for (let colIdx = row.length; colIdx < mincols; colIdx++) {
        row.push("");
      }
    }
    return this;
  }

  print() {
    let toPrint = "";
    for (let rowIdx = 0; rowIdx < this.data.length; rowIdx++) {
      toPrint += rowIdx + 1;
      const row = this.data[rowIdx];
      for (let colIdx = 0; colIdx < row.length; colIdx++) {
        toPrint += " " + row[colIdx];
      }
      toPrint += "\n";
    }
    console.log(toPrint);
    return this;
  }
}
