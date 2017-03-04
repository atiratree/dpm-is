/**
 * Corrects permission for Schedule spreadsheets and sheet 'Rozpis' which are max 13 months old
 * Removes all permisissions for 14-13 months old spreadsheets
 */
function correctProtections() {
  var leaders = Utils.findGroupLeaders();
  var admins = Utils.convertObjectsToArrayByProperty(Utils.findEmployees(['email'], {
    permission: Utils.AccessEnums.ADMIN
  }), 'email');

  var day = new Date();
  day.setMonth(day.getMonth() - 13); // allow 13 months for editting
  var accessibleStartYear = day.getFullYear();
  var accessibleStartWeek = Utils.getWeekNumber(day);

  day.setMonth(day.getMonth() - 1); // disable sheets 14 - 13 months so we don't need to open all of the older ones
  var dissableStartYear = day.getFullYear();
  var dissableStartWeek = Utils.getWeekNumber(day);

  Utils.findFiles([], {
    type: 'Rozpis'
  }).filter(function(file) {
     return file.year > dissableStartYear || (file.year == dissableStartYear && file.week >= dissableStartWeek); // filter last 14 months
  }).forEach(function(file) {
    var sheet;
    try {
      sheet = Utils.openSpreadsheet(file.id).getSheetByName('Rozpis');

      if (sheet == null) {
        return;
      }
    }catch(e){
      Utils.logError(e);
      return;
    }

    var emails;
    if (file.year > accessibleStartYear || (file.year == accessibleStartYear && file.week >= accessibleStartWeek)){ // add rights only to last 13 months
      emails = leaders.filter(function(a) {
        return a.group == file.group;
      });
      emails = Utils.convertObjectsToArrayByProperty(emails, 'employeeEmail');
      emails.push.apply(emails, admins);
    }else{
      emails = []; // remove access for the older ones
    }

    appplyProtections(sheet.protect(), emails);
  });
}

/**
 * Corrects database permissions for all empoyees
 * @param {Object} employees object of all employees
 */
function correctDbProtections(employees) {
  var admins = filterByPermission_(employees, Utils.AccessEnums.ADMIN);
  var leaders = filterByPermission_(employees, Utils.AccessEnums.LEADER);
  var administration = filterByPermission_(employees, Utils.AccessEnums.ADMINISTRATIVE);
  var leadersSheets = ['Assistants', 'GroupActors', 'GroupLeaders', 'Tariffs', 'Clients', 'Triggers', 'GroupClients', 'Events'];
  var administrationSheets = ['Tariffs'];

  Utils.openSpreadsheet(Utils.manager.dbID).getSheets().forEach(function(sheet) {
    var sheetName = sheet.getName();
    var finalEmails = [];

    finalEmails.push.apply(finalEmails, admins);

    if (leadersSheets.indexOf(sheetName) > -1) {
      finalEmails.push.apply(finalEmails, leaders);
    }

    if (administrationSheets.indexOf(sheetName) > -1) {
      finalEmails.push.apply(finalEmails, administration);
    }

    appplyProtections(sheet.protect(), finalEmails);
  });
}

function filterByPermission_(employees, permission) {
  return Utils.convertObjectsToArrayByProperty(employees.filter(function(employee) {
    return employee.permission == permission;
  }), 'email');
}
