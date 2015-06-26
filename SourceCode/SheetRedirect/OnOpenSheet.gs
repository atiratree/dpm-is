/**
 * Reloads data for spreadsheet, generates sheets for assistants and creates menu for admins/leaders
 *
 */
function onOpenSheet() {  
  var spreadSheet = SpreadsheetApp.getActive();
  spreadSheet.toast('Načítají se data a generují listy...'); 
  updateSpreadSheet(spreadSheet, true);
 
  if (Utils.getUserPermission() == Utils.AccessEnums.ADMIN || Utils.getUserPermission() == Utils.AccessEnums.LEADER) {  
    spreadSheet.toast('...'); 
      // not working
  /*  var mainSheet = spreadSheet.getSheetByName('Rozpis');
    mainSheet.getRange(1, 40).setValue('1');*/
     /*SpreadsheetApp.getUi()
      .createMenu('Funkcionalita sešitu')
      .addItem('Načti znovu data', 'reloadData')
      .addItem('Generovat listy asistentů', 'reloadSheets')  
      .addItem('Zkontrolovat duplicity v programu asistentů', 'checkAssistantDuplicities')
      .addToUi();*/
    initializeData();   
  }
  
  spreadSheet.toast('Hotovo.'); 
}


/**
 * Reloads data for spreadsheet to use, to user properties. 
 *
 * @param spreadSheet spreadSheet object to reload
 * @return "cached"(we don't have to get them from slow db) data for reusing
 */
function initializeData() {
  var clients, tariffs, actors, events, sheetRecord, group;
  var spreadSheet = SpreadsheetApp.getActive();
  try {
    sheetRecord = Utils.findFiles(['group'], {
      id: spreadSheet.getId()
    },1)[0];
    group = sheetRecord.group;

    clients = Utils.findGroupClients(['name'], { group: group});
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
 * @return returns default tariff
 */
function getDefaultTariff_(tariffs) {
  for (var i = 0; i < tariffs.length; i++) {
    if (tariffs[i]['default'] == 1) {
      return tariffs[i].shortcut;
    }
  }
  return '';
}

/**
 * Wrapper funtion
 */
function reloadData(){
  SpreadsheetApp.getActive().toast('Načítají se znovu veškerá data...');   
  updateSpreadSheet(SpreadsheetApp.getActive());  
  initializeData();
  SpreadsheetApp.getActive().toast('Data načtena.'); 
}

/**
 * Wrapper funtion
 */
function reloadSheets(){
  SpreadsheetApp.getActive().toast('Generují se listy asistentů...'); 
  updateSpreadSheet(SpreadsheetApp.getActive(), true);  
  SpreadsheetApp.getActive().toast('Hotovo.'); 
}