/**
 * Sorts data from sheet rozpis and creates sheets for all group actors and assigns appropriate data
 *
 * @param spreadSheet spreadsheet for refreshing
 * @param actors array of actors
 * @param eventsNames array with names of events
 */
function refreshAssistantsSheets(spreadSheet, actors, eventsNames) {
  spreadSheet = spreadSheet ? spreadSheet : SpreadsheetApp.getActiveSpreadsheet();
  var mainSheet = spreadSheet.getSheetByName('Rozpis');
  var data = [];

  for (var i = 1; i < 8; i++) {
    data.push(Utils.extractSpreadSheet(mainSheet, [{
      dayInWeek: i
    }]));
  }
  if(actors == null){
    return;
  }
  actors = actors = Utils.sort(actors,'nick');
  
  actors.forEach(function(item) {
    var sheet = spreadSheet.getSheetByName(item.nick);
    if (sheet == null) {
      var sheetRecord = Utils.findFiles([], {
        id: spreadSheet.getId()
      })[0];
      var messages = ['Rozpis služeb ' + item.nick, 'týden č. ' + sheetRecord.week, sheetRecord.year];

      sheet = spreadSheet.insertSheet(item.nick);
      spreadSheet.setActiveSheet(mainSheet);
      try { // limit 2 000 000 cells per spreadsheet 1000 rows x 100 celss per sheet
        sheet.deleteRows(61, 1000 - 60);
      } catch (ex) { // if google changed default limits of sheet catch exception
        Utils.logError(ex);
      }   
      Utils.prepareSheet(sheet, new Date(sheetRecord.weekStarts), messages);
    }
    Utils.copyDataBetweenSheets(mainSheet, sheet, data, eventsNames, false);
  });
}
