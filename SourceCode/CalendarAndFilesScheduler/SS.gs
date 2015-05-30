/**
 * Corrects permission for all Schedule spreadsheets and sheet 'Rozpis'
 */
function correctProtections() {
  var leaders = Utils.findGroupLeaders();
  var admins = Utils.convertObjectsToArrayByProperty(Utils.findEmployees(['email'], {
    permission: Utils.AccessEnums.ADMIN
  }), 'email');

  Utils.findFiles([], {
    type: 'Rozpis'
  }).forEach(function(file) {
    var sheet = SpreadsheetApp.openById(file.id).getSheetByName('Rozpis');
    if (sheet == null) {
      return;
    }
    var emails = leaders.filter(function(a) {
      return a.group == file.group;
    });
    emails = Utils.convertObjectsToArrayByProperty(emails, 'employeeEmail');
    emails.push.apply(emails, admins);

    appplyProtections(sheet.protect(), emails);
  });
}

/**
 * Corrects database permissions for all empoyees
 * @param employees object of all employees
 */
function correctDbProtections(employees) {
  var admins = filterByPermission_(employees, Utils.AccessEnums.ADMIN);
  var leaders = filterByPermission_(employees, Utils.AccessEnums.LEADER);
  var administration = filterByPermission_(employees, Utils.AccessEnums.ADMINISTRATIVE);
  var leadersSheets = ['Assistants', 'GroupActors', 'GroupLeaders', 'Tariffs', 'Clients', 'Triggers', 'GroupClients', 'Events'];
  var administrationSheets = ['Tariffs'];

  SpreadsheetApp.openById(Utils.manager.dbID).getSheets().forEach(function(sheet) {
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
