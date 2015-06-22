/**
 * Function which processes behaviour when spreadsheet is edited
 *
 * @param e event send from spreadsheet
 */
function editMainSheet(e) {
  var sheet = e.source.getActiveSheet(); 
  
  if (sheet.getName() === 'Rozpis') {
       
    var col = e.range.getColumn();
    var row = e.range.getRow();
    var rows = e.range.getNumRows();
    var cols = e.range.getNumColumns();
    
    if(rows > 5){ // don't check large quantities == slow 
      return;
    }
    
    //hack for running functions
    if( col == 1 && row == 70){
      var value = sheet.getRange(70, 1).getValue()
      sheet.getRange(70, 1).setValue('');
      
      if (value == 1){
        reloadData();
      } else if (value == 2){
        reloadSheets();
      } else if (value == 3){
        checkAssistantDuplicities();
      } 
    }
    
    for (var j = 0; j < rows; j++) {
      if ((row + j > 4 && row + j < 33) || (row + j > 36 && row + j < 57)) // select our specified area
        for (var i = 0; i < cols; i++) { // we can delete more rows at once and keep formating, but we can insert only value to one cell
          
          if (((col + i + 2) % 6 == 0)) {
            employeeChanged(e, sheet, col + i, row + j);
          }
          if (((col + i + 3) % 6 == 0)) {
            mainEventChanged(e, sheet, col + i, row + j);
          }
          if (((col + i + 4) % 6 == 0)) {
            dateChanged(e, sheet, col + i - 1, row + j);
          }
          if (((col + i + 5) % 6 == 0)) {
            dateChanged(e, sheet, col + i, row + j);
          }
      }
    }   
  }
}

/**
 * Manipulates row if selected value is event or client
 *
 * @param e event send from spreadsheet
 * @param sheet sheet of event
 * @param col col of event
 * @param row row of event
 */
function mainEventChanged(e, sheet, col, row) {
  if (e.value && isSelectedMainEvent(e.source, e.value)) {
    sheet.getRange(row, col, 1, 3).setBackground('#ffffff');
    sheet.getRange(row, col + 1, 1, 2).setValue('');
  }
}

/**
 * Validates values of changed date
 *
 * @param sheet sheet of event
 * @param col col of event
 * @param row row of event
 */
function dateChanged(sheet, col, row) {
  var from = sheet.getRange(row, col, 1, 1);
  var to = sheet.getRange(row, col + 1, 1, 1);

  if (from != '' && to != '' && Utils.compareTimes(from.getValue(), to.getValue()) < 0) {
    to.setValue('');
    SpreadsheetApp.getUi().alert(to.getA1Notation() + ': Od je větší než Do !')
  }
}

/**
 * Resolves colours and default tariff if employee selected
 *
 * @param e event send from spreadsheet
 * @param sheet sheet of event
 * @param col col of event
 * @param row row of event
 */
function employeeChanged(e, sheet, col, row) {
  var background = '#ffffff';
  var tariff = sheet.getRange(row, col + 1).getValue();
  var value = sheet.getRange(row, col).getValue(); 
  
  if (value) {
    var colors = manager.colors ? manager.colors : getScriptData('colors');
    var index = manager.index ? manager.index : getScriptData('nicks').indexOf(value);
    var defaultTariff = manager.defaultTariff ? manager.defaultTariff : getScriptData('defaultTariff');
    var mainEventRange = sheet.getRange(row, col - 1);
 
    if (index > -1 && colors[index]) {
      background = colors[index];
    }

    if (defaultTariff && tariff == '') {
      tariff = defaultTariff;
    }

    if (isSelectedMainEvent(e.source, mainEventRange.getValue())) {
      mainEventRange.setValue('');
    }
  }
  
  sheet.getRange(row, col + 1).setValue(tariff);
  sheet.getRange(row, col - 1, 1, 3).setBackground(background);
}

/**
 * Checks if is main event
 *
 * @param spreadSheet spreadSheet 
 * @param value value of selected field
 * @return true if selected event is not a client
 */
function isSelectedMainEvent(spreadSheet, value) {
  var events = manager.events ? manager.events : getScriptData('events');
  
  return events.indexOf(value) > -1;
}

/**
 * Checks sheet has duplicates in times for one assistant
 *
 */
function checkAssistantDuplicities(){
  SpreadsheetApp.getActive().toast('Kontrola duplicit...'); 
  var sheet = SpreadsheetApp.getActive().getSheetByName('Rozpis');  
  var width = 6 // num of columns per day
  var messages = '';
  
  for (var i = 1; i < 6; i++) {
    messages += checkDayDuplicities(sheet, 4, i, 28,width);
  }

  for (var i = 1; i < 3; i++) {
    messages += checkDayDuplicities(sheet, 36, i, 20, width);
  }
  
  if(messages){
    SpreadsheetApp.getUi().alert('Byly nalezeny tyto nesrovnalosti :\n\n' + messages);
  }else{
    SpreadsheetApp.getActive().toast('V pořádku.'); 
  }
 
}

/**
 * Checks if day in sheet has duplicates in times for one assistant
 *
 * @param sheet sheet to check
 * @param row row where to check
 * @param column column where to check
 * @param numberOfRows numberOfRows to check
 * @param width width of one day(for now should be 6 only)
 */
function checkDayDuplicities(sheet, row, column, numberOfRows, width) {
  var block = column * width;
  var froms = sheet.getRange(row + 1, block - 5, numberOfRows, 1).getValues().map(function(item){return item[0]});
  var tos = sheet.getRange(row + 1, block - 4, numberOfRows, 1).getValues().map(function(item){return item[0]});
  var events = sheet.getRange(row + 1, block - 3, numberOfRows, 1).getValues().map(function(item){return item[0]});
  var nicks = sheet.getRange(row + 1, block - 2, numberOfRows, 1).getValues().map(function(item){return item[0]});
  var tariffs = sheet.getRange(row + 1, block - 1, numberOfRows, 1).getValues().map(function(item){return item[0]});
  
  var uniqueNicks = Utils.toUniquePrimitiveArray(nicks);
  var index = uniqueNicks.indexOf("");
  if(index > -1){
    uniqueNicks.splice(index,1);
  }
  
  var resultMessages = ''
  
  uniqueNicks.forEach(function(nick){
    var times = [];
    for(var i = 0; i < nicks.length; i++){     
      if(nicks[i] == nick){
        var from = froms[i];
        var to = tos[i];   
        
        if (from == '' || to == '' || events[i] == '' || nick == '' || tariffs[i] == '') {
          var range = sheet.getRange(row + i + 1, block - 5, 1, 5);
          resultMessages += range.getA1Notation() + ' - nedostatečně vyplněno (Duplicity u ' + nick + ' nebyly zkontrolovány)\n';
          return;
        }        
        var fromDate = new Date(from);
        var toDate = new Date(to);
        times.push({from: fromDate.getTime(), to: toDate.getTime()});  
      }      
    }
    times.sort(function(a,b){
       return (a.from - b.from);
    });
    
    for(var i = 0; i < times.length; i++){
      var duration = times[i];
      for(var j = i + 1; j < times.length; j++){
        var otherDuration = times[j];
        
        if((duration.to > otherDuration.from && duration.from < otherDuration.to)){
          var range = sheet.getRange(row + 1, block - 5, numberOfRows, 2);
          resultMessages += range.getA1Notation() + ' - byly nalezeny duplicity u ' + nick + '\n';
          return;
        }
      }
    }       
  });
  return resultMessages;
}

/* Manager for storing and caching*/
var manager = { 
  colors: null,
  index: null,
  defaultTariff: null,
  events: null
}  