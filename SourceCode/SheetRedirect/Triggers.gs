/**
 * Resolves triggers of a spreadsheet and generates assistants sheets from data in 'Rozpis' sheet
 *
 * @param id id of spreadsheet
 */
function resolveTriggers(id) {
  try {
    var ss = SpreadsheetApp.openById(id);
    var data = loadDataAndSave(ss);

    if (Utils.getUserPermission() == Utils.AccessEnums.ADMIN || Utils.getUserPermission() == Utils.AccessEnums.LEADER) {
      updateMainSheet(ss, data.clientsArray, data.nicksArray, data.tariffs)
      resolveOnEdit(ss);
    }
    refreshAssistantsSheets(ss);
  } catch (x) {
    Utils.logError(x);
  }
}

/**
 * If spreadsheet doesn't have any triggers assigned, this function assigns trigger to active user. 
 * If trigger capacity reaches maximum, it tries to delete oldest trigger this function assigned.
 *
 * @param ss spreadsheet for setting triggers
 */
function resolveOnEdit(ss) {
  try {
    var email = Utils.getUserEmail();
    var triggers = Utils.findTriggers([], {
      sheetId: ss.getId()
    }, 1);

    if (triggers.length > 0) {
      return;
    }

    ScriptApp.newTrigger('editMainSheet').forSpreadsheet(ss).onEdit().create(); // Script can have only 20 triggers and we don't if that changes in the future 
    try {
      Utils.createTrigger({
        sheetId: ss.getId(),
        email: email
      });
    } catch (x) {
      Utils.logError(x);
    }
  } catch (x) {
    if (deleteLowestTrigger() > 0) {
      resolveOnEdit(ss);
    } else {
      Utils.logError(email + ' has no place for triggers! Other scripts are using all triggers of this user!');
    }

  }
}

/**
 * Tries to delete lowest trigger of active user
 *
 * @return number of deleted triggers
 */
function deleteLowestTrigger() {
  var email = Utils.getUserEmail();
  var triggers = ScriptApp.getProjectTriggers();
  var fileTriggers = Utils.findTriggers([], {
    email: email
  });
  var lowestTrigger = {
    sheetId: 0,
    emailSequence: 0
  }; // 0 if no triggers installed 

  fileTriggers.forEach(function(item) {
    if ((item.emailSequence < lowestTrigger.emailSequence || lowestTrigger.emailSequence == 0) && item.emailSequence != 0) {
      lowestTrigger = item;
    }
  });

  for (var j = 0; j < triggers.length; j++) {
    if (lowestTrigger.sheetId === triggers[j].getTriggerSourceId()) {
      ScriptApp.deleteTrigger(triggers[j]);
      return Utils.deleteTrigger(lowestTrigger);
    }
  }
  return 0;
}
