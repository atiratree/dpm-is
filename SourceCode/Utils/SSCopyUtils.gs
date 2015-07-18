
/**
 * Copies data between two sheets, only sorted out data will be in secondary sheet
 *
 * @param main main spreadsheet
 * @param secondary spreadsheet to be coppied into
 * @param data data from main spreadsheet
 * @param eventsNames array with events names
 * @param clientNames if true copies clients data, assistants otherwise
 */
function copyDataBetweenSheets(main, secondary, data, eventsNames, clientNames, smallLayout){
  var name = secondary.getName();
  
  var firstDays = smallLayout ? 3 : 5;
  var secondDays = 2;
  
  var firstRow = 5;
  var secondRow = smallLayout ? 24 : 37;
  var thirdRow = smallLayout ? 43 : 0;
  
  var firstRows = smallLayout ? 15 : 28;
  var secondRows = smallLayout ? 15 : 20;
  var thirdRows = smallLayout ? 15 : 0;
  
  main = smallLayout ? null : main;

  for (var i = 0; i < data.length; i++) {
    var cleanData;
    
    if(clientNames){
      cleanData = data[i].filter(function(a) {
        return clientNames.indexOf(a.event) > -1;
      })
    }else{      
      cleanData = data[i].filter(function(a) {
        return a.employee == name || eventsNames.indexOf(a.event) > -1;
      })
    }
    
    cleanData = cleanData.sort(function(a, b) {
      return new Date(a.from) - new Date(b.from);
    }).map(function(a) {
      return [a.from, a.to, a.event, a.employee, a.tariff, a.note];
    });
    
    if (i < firstDays) {
      copyDayRange(main, secondary, firstRow,  (i + 1) * 6, firstRows, cleanData);
    } else if (i < firstDays + secondDays){
      copyDayRange(main, secondary, secondRow, (i + 1 - firstDays) * 6, secondRows, cleanData);
    }else{
      copyDayRange(main, secondary, thirdRow, (i + 1 - firstDays - secondDays) * 6, thirdRows, cleanData);
    }
  }  
}

/**
 * Copies data for one day between two sheets
 *
 * @param main main spreadsheet used for copying notes at the bottom
 * @param sheet spreadsheet to be coppied into
 * @param row row of sheet to start writing data
 * @param block last column  of block to start writing data, block has 6 columns
 * @param numberOfRows numberOfRows of one day
 * @param data data to be written in sheet
 */
function copyDayRange(mainSheet, sheet, row, block, numberOfRows, data) {
  if(row == null)
    return 
    
  var allRange = sheet.getRange(row, block - 5, numberOfRows + 1, 6); 
  var timesRange = sheet.getRange(row, block - 5, numberOfRows, 2);
  
  allRange.setValue('');
  timesRange.setNumberFormat('HH:mm:ss');
  
  if (data.length > 0) {
    sheet.getRange(row, block - 5, data.length, 6).setValues(data);
  }
  
  if(mainSheet != null){
    var noteMainRange = mainSheet.getRange(row + numberOfRows, block - 5, 1, 6);
    var noteSecondaryRange = sheet.getRange(row + numberOfRows, block - 5, 1, 6);
    noteSecondaryRange.setValue(noteMainRange.getValue());
  }  
}
