/**
 * Sorts data from sheet rozpis and creates sheets for all group actors and assigns appropriate data
 *
 * @param spreadSheet spreadsheet for refreshing
 * @param layoutAndData object contains data and layout
 * @param actors array of actors
 * @param eventsNames array with names of events
 */
function refreshAssistantsSheets(spreadSheet, layoutAndData, actors, eventsNames) {
  spreadSheet = spreadSheet ? spreadSheet : SpreadsheetApp.getActiveSpreadsheet();
  var mainSheet = spreadSheet.getSheetByName('Rozpis');
  if(actors == null){
    return;
  }
  actors = actors = Utils.sort(actors, 'nick');

  var sheetRecord = Utils.findFiles([], {
    id: spreadSheet.getId()
  })[0];

  actors.forEach(function(item) {
    var sheet = spreadSheet.getSheetByName(item.nick);
    if (sheet == null) {
      sheet = spreadSheet.insertSheet(item.nick);
      spreadSheet.setActiveSheet(mainSheet);
    }
    sheet.clear();
    var messages = ['Rozpis služeb ' + item.nick, 'týden č. ' + sheetRecord.week, sheetRecord.year];
    Utils.prepareSheet(sheet, new Date(sheetRecord.weekStarts), messages, layoutAndData.weekday.length, layoutAndData.weekend.length, false);

    var data = layoutAndData.data.filter(function(a) {
      return a.employee == item.nick || eventsNames.indexOf(a.event) > -1;
    });

    Utils.writeDataToSheet(sheet, data, layoutAndData.notes, layoutAndData.weekday.length, layoutAndData.weekend.length, false);
  });
}
