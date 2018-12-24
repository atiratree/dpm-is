/**
 * Creates all spreadsheets not existing in this week
 *
 * @param day monday of week to be set
 * @param week week to be refreshed
 * @param data object with data  
 */
function refreshSpreadSheet(day, week, data) {
  var files = data.files;
  var groups = data.groups;

  day.setHours(0, 0, 0, 0);

  for (var i = 0; i < groups.length; i++) {
    var group = groups[i];
    var findObj = {
      year: Utils.getWeeksYear(day),
      week: week,
      group: group,
      owner: '',
      type: 'Rozpis',
      weekStarts: day.toISOString()
    };

    if (!isFileInDB(files, findObj)) {
      var ss = Utils.createSpreadsheet(findObj);
      var file = DriveApp.getFileById(ss.getId());
      var sheet = ss.getActiveSheet();

      file.setSharing(DriveApp.Access.DOMAIN_WITH_LINK, DriveApp.Permission.EDIT);

      sheet.setName('Rozpis');
      Utils.prepareSheet(sheet, day, ['Rozpis služeb tým ' + group, 'týden č. ' + week, findObj.year]);
    }
  }
}
