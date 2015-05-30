/**
 * Reloads data for spreadsheet to use, to user properties. 
 *
 * @param spreadSheet spreadSheet object to reload
 * @return "cached"(we don't have to get them from slow db) data for reusing
 */
function loadDataAndSave(spreadSheet) {
  var clients, tariffs, actors, nicksArray, clientsArray, sheetRecord, group;

  try {
    sheetRecord = Utils.findFiles(['group'], {
      id: spreadSheet.getId()
    })[0];
    group = sheetRecord.group;

    clients = getClientAndEvents(group);
    tariffs = Utils.findTariffs();
    actors = getActors(group);
    nicksArray = Utils.convertObjectsToArrayByProperty(actors, 'nick');
    clientsArray = Utils.convertObjectsToArrayByProperty(clients, 'name');

    saveData(spreadSheet, 'nicks', nicksArray);
    saveData(spreadSheet, 'colors', Utils.convertObjectsToArrayByProperty(actors, 'color'));
    saveData(spreadSheet, 'actors', actors);
    saveData(spreadSheet, 'clientsNames', clientsArray);
    saveData(spreadSheet, 'clientsSpecial', Utils.convertObjectsToArrayByProperty(clients, 'special'));
    saveData(spreadSheet, 'defaultTariff', getDefaultTariff(tariffs));
  } catch (e) {
    Utils.logError(e);
  }

  return {
    clientsArray: clientsArray,
    nicksArray: nicksArray,
    tariffs: tariffs
  };
}

/**
 * Reloads and prepares spreadsheet for a user.
 *
 * @param spreadSheet object of a spreadSheet to update
 * @param clientsArray array with clients of this spreadSheet's group
 * @param nicksArray array with nicks of this spreadSheet's group
 * @param tariffs array with tariffs of this spreadSheet's group
 * @return "cached"(we don't have to get them from slow db) data for reusing
 */
function updateMainSheet(spreadSheet, clientsArray, nicksArray, tariffs) {
  var rules = makeRules([clientsArray, nicksArray, {
    array: tariffs,
    convertProp: 'shortcut'
  }]);
  var width = 6 // num of columns per day
  var sheet = spreadSheet.getSheetByName('Rozpis');

  for (var i = 1; i < 6; i++) {
    updateDayRange(sheet, 4, i, 28, rules, width);
  }

  for (var i = 1; i < 3; i++) {
    updateDayRange(sheet, 36, i, 20, rules, width);
  }
}

/**
 * Makes rules for data validation
 *
 * @param arrays array of arrays, fields of each array are values used for each rule (i.e. only these values are valid)
 * @return arrays of rules in the same order as input
 */
function makeRules(arrays) {
  var result = []
  for (var i = 0; i < arrays.length; i++) {
    var tmp;
    if (arrays[i] instanceof Array) {
      tmp = arrays[i];
    } else {
      tmp = Utils.convertObjectsToArrayByProperty(arrays[i].array, arrays[i].convertProp);
    }
    result.push(SpreadsheetApp.newDataValidation().requireValueInList(tmp).setAllowInvalid(false).build());
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

/**
 * @param tariffs all tariffs with its attributes
 * @return returns default tariff
 */
function getDefaultTariff(tariffs) {
  for (var i = 0; i < tariffs.length; i++) {
    if (tariffs[i]['default'] == 1) {
      return tariffs[i].shortcut;
    }
  }
  return '';
}

/**
 * Gets all clients and events associated with this group
 *
 * @param group group identificator for events and clients
 * @return returns all events and clients with special attribute
 */
function getClientAndEvents(group) {
  var clients = Utils.findGroupClients(['name'], {
    group: group
  }).map(function(item) {
    item.special = 0;
    return item;
  });

  var events = Utils.findEvents().map(function(item) {
    item.special = 1;
    return item;
  });

  clients.push.apply(clients, events);

  return clients;
}
