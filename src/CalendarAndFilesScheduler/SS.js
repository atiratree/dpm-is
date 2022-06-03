var numberOfMonthsBackAllowedForEditing = 3;

// must be at least as big as numberOfMonthsBackAllowedForEditing
// removes rights from older month(s) than numberOfMonthsBackAllowedForEditing
var numberOfMonthsBackForRemovingRights = numberOfMonthsBackAllowedForEditing + 1

/**
 * Corrects permission for Schedule spreadsheets and sheet 'Rozpis' which are max 13 months old
 * Removes all permisissions for 14-13 months old spreadsheets
 */
function correctProtections() {
  var leaders = Utils.findGroupLeaders();
  var admins = Utils.convertObjectsToArrayByProperty(Utils.findEmployees(['email'], {
    permission: Utils.AccessEnums.ADMIN
  }), 'email');

  if (numberOfMonthsBackForRemovingRights < numberOfMonthsBackAllowedForEditing){
    throw new Error("numberOfMonthsBackForRemovingRights must be at least as big as numberOfMonthsBackAllowedForEditing")
  }

  var day = new Date();
  day.setMonth(day.getMonth() - numberOfMonthsBackAllowedForEditing); // allow months for editting
  var accessibleStartYear = Utils.getWeeksYear(day);
  var accessibleStartWeek = Utils.getWeekNumber(day);

  day.setMonth(day.getMonth() - (numberOfMonthsBackForRemovingRights - numberOfMonthsBackAllowedForEditing)); // disable sheets gradually over time so we don't need to open all of the older ones
  var dissableStartYear = Utils.getWeeksYear(day);
  var dissableStartWeek = Utils.getWeekNumber(day);

  Utils.findFiles([], {
    type: 'Rozpis'
  }).filter(function(file) {
     return file.year > dissableStartYear || (file.year == dissableStartYear && file.week >= dissableStartWeek); // filter last dissable months
  }).forEach(function(file) {
    var sheet;
    try {
      sheet = Utils.openSpreadsheet(file.id).getSheetByName('Rozpis');

      if (sheet == null) {
        return;
      }
    } catch(e) {
      Utils.logError(e);
      return;
    }

    var emails;
    if (file.year > accessibleStartYear || (file.year == accessibleStartYear && file.week >= accessibleStartWeek)){ // add rights only to last accessible months
      emails = leaders.filter(function(a) {
        return a.group == file.group;
      });
      emails = Utils.convertObjectsToArrayByProperty(emails, 'employeeEmail');
      emails.push.apply(emails, admins);
    } else {
      emails = []; // remove access for the older ones
    }

    appplyProtections(sheet.protect(), emails);
  });
}
