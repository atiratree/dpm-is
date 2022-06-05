/**
 * Reloads data for spreadsheet, generates sheets for assistants and creates menu for admins/leaders
 *
 */
function onOpenSheet () {
  try {
    var spreadSheet = SpreadsheetApp.getActive();

    var isLeader = Utils.getUserPermission() == Utils.AccessEnums.ADMIN || Utils.getUserPermission() == Utils.AccessEnums.LEADER;
    if (isLeader) {
      toast(spreadSheet, 'Načítají se data');
      initializeData();
    }

    var sheet = spreadSheet.getSheetByName('Rozpis') || spreadSheet.getSheets()[0];
    var layoutAndData = Utils.extractSpreadsheetData(sheet);

    // alert when sheet is in incompatible format
    if (!layoutAndData.valid) {
      var dataTmp = layoutAndData.data;
      layoutAndData.data = [];
      Utils.logError(spreadSheet.getName() +': Rozpis je ve špatném formátu a funkcionalita je omezená! Pro správnou funkcionalitu je potřeba opravit. Detekovaný formát: ' + JSON.stringify(layoutAndData));
      alertUi('Rozpis je ve špatném formátu a funkcionalita je omezená! Pro správnou funkcionalitu je potřeba opravit. Detekovaný formát: ' + JSON.stringify(layoutAndData));
      layoutAndData.data = dataTmp;
    }

    if (layoutAndData.valid) {
      updateSpreadSheet(spreadSheet, layoutAndData, isLeader && getBoolProp('sheets_redirect_integrity'));
      SpreadsheetApp.flush();
    }

    if (getBoolProp('sheets_redirect_duplicates')) {
      checkAssistantDuplicities(layoutAndData);
      Utilities.sleep(2000); // just to see last message
    }

    toast(spreadSheet, 'Hotovo.');
  } catch (x) {
    Utils.logError(x);
  }
}

/**
 * Reloads data for spreadsheet to use, to user properties.
 *
 * @param spreadSheet spreadSheet object to reload
 * @return "cached"(we don't have to get them from slow db) data for reusing
 */
function initializeData () {
  var clients, tariffs, actors, events, sheetRecord, group;
  var spreadSheet = SpreadsheetApp.getActive();
  try {
    sheetRecord = Utils.findFiles(['group'], {
      id: spreadSheet.getId()
    }, 1)[0];
    group = sheetRecord.group;

    clients = Utils.findGroupClients(['name'], { group: group });
    events = Utils.findEvents();
    clients.push.apply(clients, events);
    tariffs = Utils.findTariffs();

    actors = getActors(group);

    saveScriptData('nicks', Utils.convertObjectsToArrayByProperty(actors, 'nick'));
    saveScriptData('colors', Utils.convertObjectsToArrayByProperty(actors, 'color'));
    saveScriptData('events', Utils.convertObjectsToArrayByProperty(events, 'name'));
    saveScriptData('defaultTariff', getDefaultTariff_(tariffs));


  } catch (e) {
    Utils.logError(e);
  }
}


/**
 * @param tariffs all tariffs with its attributes
 * @return {string} returns default tariff
 */
function getDefaultTariff_ (tariffs) {
  for (var i = 0; i < tariffs.length; i++) {
    if (tariffs[i]['default'] == 1) {
      return tariffs[i].shortcut;
    }
  }
  return '';
}
