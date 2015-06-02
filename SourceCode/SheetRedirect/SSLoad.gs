/**
 * Reloads and prepares spreadsheet for a user.
 *
 * @param spreadSheet object of a spreadSheet to update
 * @param assistSheets if true generates assistants sheets
 */
function updateSpreadSheet(spreadSheet, assistSheets) {
  var sheetRecord = Utils.findFiles(['group'], {
      id: spreadSheet.getId()
    },1)[0];    
  var group = sheetRecord.group;
  
  var tariffs = Utils.findTariffs();
  var actors = getActors(group);
  var clients = Utils.findGroupClients(['name'], { group: group});
  var events = Utils.findEvents();
  clients.push.apply(clients, events);  
  
  var arrays = [{array: clients, convertProp: 'name'}, {array: actors, convertProp: 'nick'}, {array: tariffs, convertProp: 'shortcut'}]  
  
  
  var rules = makeRules(arrays);  
  var width = 6 // num of columns per day
  var sheet = spreadSheet.getSheetByName('Rozpis');
  
  for (var i = 1; i < 6; i++) {
    updateDayRange(sheet, 4, i, 28, rules, width);
  }

  for (var i = 1; i < 3; i++) {
    updateDayRange(sheet, 36, i, 20, rules, width);
  }
  
  sheet.getRange('A66:B69').setValues([[ 'Hodnota', "Typ akce"], [ 1, "Načti znovu data"], [ 2, "Generovat listy asistentů"], [ 3, "Zkontrolovat duplicity v programu asistentů"]]);
  sheet.getRange('A70').setBackground('#ff5d5d');
  
  if(assistSheets){
    refreshAssistantsSheets(spreadSheet,actors,Utils.convertObjectsToArrayByProperty(events, 'name'));
  }  
}

/**
 * Makes rules for data validation
 *
 * @param arrays array of arrays, fields of each array are values used for each rule (i.e. only these values are valid)
 * @return arrays of rules in the same order as input
 */
function makeRules(arrays) {
  var result = [];
  
  for (var i = 0; i < arrays.length; i++) {
    var values = Utils.convertObjectsToArrayByProperty(arrays[i].array, arrays[i].convertProp);  
    result.push(SpreadsheetApp.newDataValidation().requireValueInList(values).setAllowInvalid(false).build());
  }
  
  return result;
}

/**
 * Updates one day in a spreadsheet
 *
 * @param sheet sheet to update
 * @param row row where to start updating
 * @param column column where to start updating
 * @param numberOfRows numberOfRows to update
 * @param rules rules to set for associated drop down lists
 * @param width width of one day(for now should be 6 only)
 */
function updateDayRange(sheet, row, column, numberOfRows, rules, width) {
  var block = column * width;
  var timesRange = sheet.getRange(row + 1, block - 5, numberOfRows, 2);
  var clientsRange = sheet.getRange(row + 1, block - 3, numberOfRows, 1);
  var assistantsRange = sheet.getRange(row + 1, block - 2, numberOfRows, 1);
  var tarifsRange = sheet.getRange(row + 1, block - 1, numberOfRows, 1);
  
  clientsRange.setDataValidation(rules[0]);
  assistantsRange.setDataValidation(rules[1]);
  tarifsRange.setDataValidation(rules[2]);

  timesRange.setNumberFormat('[hh]:mm:ss');
  timesRange.setDataValidation(SpreadsheetApp.newDataValidation()
    .requireFormulaSatisfied('= REGEXMATCH( TO_TEXT(INDEX(' + timesRange.getCell(1, 1).getA1Notation() +
      ')),"^((([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9])|24:00:00)$")')
    .setAllowInvalid(false).build());
}

/**
 * gets employees associated with this group
 *
 * @param group group
 * @return actors of this group
 */
function getActors(group) {
  var leaders = Utils.convertObjectsToArrayByProperty(Utils.findGroupLeaders(['employeeEmail'], {
    group: group
  }), 'employeeEmail');
  var actors = Utils.convertObjectsToArrayByProperty(Utils.findGroupActors(['employeeEmail'], {
    group: group
  }), 'employeeEmail');
  var employees = Utils.findEmployees(['email', 'nick', 'color']);

  actors.push.apply(actors, leaders);
  actors = Utils.toUniquePrimitiveArray(actors);

  return employees.filter(function(item) {
    return actors.indexOf(item.email) > -1;
  });
}
