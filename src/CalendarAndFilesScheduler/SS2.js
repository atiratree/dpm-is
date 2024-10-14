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
    if (group.status != "active") {
      continue
    }
    var findObj = {
      year: Utils.getWeeksYear(day),
      week: week,
      group: group.group,
      owner: '',
      type: 'Rozpis',
      // store in UTC, but rest of the code holds expectation that the scripts will always run under the same time zone, which is Europe/Prague
      weekStarts: day.toISOString()
    };

    if (!isFileInDB(files, findObj)) {
      var ss = Utils.createSpreadsheet(findObj);
      var file = DriveApp.getFileById(ss.getId());
      var sheet = ss.getActiveSheet();

      file.setSharing(DriveApp.Access.DOMAIN_WITH_LINK, DriveApp.Permission.EDIT);
      file.setShareableByEditors(false);

      sheet.setName('Rozpis');
      Utils.prepareSheet(sheet, day, ['Rozpis služeb tým ' + group.group, 'týden č. ' + week, findObj.year], group.weekdayRows, group.weekendRows, false);
    }
  }
}
