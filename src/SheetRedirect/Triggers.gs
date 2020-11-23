/**
 * Resolves triggers of a spreadsheet and generates assistants sheets from data in 'Rozpis' sheet
 *
 * @param id id of spreadsheet
 */
function resolveTriggers(id) {
  try {
    var userPerm = Utils.getUserPermission();
    if (userPerm == Utils.AccessEnums.ADMIN || userPerm == Utils.AccessEnums.LEADER) {
      var myGroupsWithEditAttributs = Utils.getMyGroupsWithEditAtrs();
      resolveMisplacedTriggers(myGroupsWithEditAttributs, 'edit', 'editMainSheet');
      resolveMisplacedTriggers(myGroupsWithEditAttributs, 'open', 'onOpenSheet');

      if (Utils.canEditFile(myGroupsWithEditAttributs, id)) {
        var ss = SpreadsheetApp.openById(id);
        resolveOnTrigger(ss, 'edit', 'editMainSheet');
        resolveOnTrigger(ss, 'open', 'onOpenSheet');
      }
    }
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
function resolveOnTrigger(ss, type, functionName) { 
  try {
    var email = Utils.getUserEmail();
    var triggers = Utils.findTriggers([], {
      sheetId: ss.getId(), 
      type: type
    }, 1);
    
    if (triggers.length > 0) {
      return;
    }
    
    var t = ScriptApp.newTrigger(functionName).forSpreadsheet(ss); 
    t = (type == 'edit') ? t.onEdit().create() : t.onOpen().create(); 
    
    try {
      Utils.createTrigger({
        sheetId: t.getTriggerSourceId(),
        email: email,
        type: type
      });
    } catch (x) {
      Utils.logError(x);
    }
    
  } catch (x) { // Script can have only 20 triggers and we don't know, if that changes in the future 
    if (deleteLowestTrigger() > 0) {
      resolveOnTrigger(ss, type, functionName);
    } else {
      Utils.logError(email + ' has no place for triggers! Other scripts are using all triggers of this user!');
    }
  }
}

/**
 * Tries to delete lowest trigger of active user
 *
 * @return {number} number of deleted triggers
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

/**
 * Deletes misplaced triggers of this user. For example if we delete row of a trigger in db, this function deletes it for user.
 *
 * @param myGroupsWithEditAttributs cached myGroupsWithEditAttributs
 * @param email email of user who owns the triggers
 * @param type type of trigger to resolve
 * @param functionName name of trigger's funtion to resolve
 */
function resolveMisplacedTriggers(myGroupsWithEditAttributs, type, functionName){ // recover if trigger is deleted from db
  var email = Utils.getUserEmail();
  var fileTriggers = Utils.convertObjectsToArrayByProperty(Utils.findTriggers([], {
    email: email,
    type: type
  }), 'sheetId');  
  var triggers = ScriptApp.getProjectTriggers();
  var evType = (type == 'edit') ? ScriptApp.EventType.ON_EDIT : ScriptApp.EventType.ON_OPEN;
  
  for (var j = 0; j < triggers.length; j++) {
    var trig = triggers[j];
   
    if(trig.getHandlerFunction() == functionName && trig.getEventType() == evType) {
      var fileId = trig.getTriggerSourceId();
      var index = fileTriggers.indexOf(fileId);
      if(index < 0 || !Utils.canEditFile(myGroupsWithEditAttributs, fileId)) {
        ScriptApp.deleteTrigger(trig);
      } else {
        fileTriggers.splice(index, 1);
      }
    }
  }
  fileTriggers.forEach(function(item) {
    Utils.deleteTrigger({sheetId: item, type: type});
  });  
}
