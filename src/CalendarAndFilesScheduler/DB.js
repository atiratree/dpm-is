
/**
 * Corrects database permissions for all empoyees
 * @param {Object} employees object of all employees
 */
function correctDBandLogFileProtections(employees) {
    const assistants = filterByPermission_(employees, Utils.AccessEnums.ASSISTANT);
    const admins = filterByPermission_(employees, Utils.AccessEnums.ADMIN);
    const leaders = filterByPermission_(employees, Utils.AccessEnums.LEADER);
    const administration = filterByPermission_(employees, Utils.AccessEnums.ADMINISTRATIVE);

    const dbViewers = new Set(assistants);
    const dbEditors = new Set([...admins, ...leaders, ...administration]);

    const dbFile = DriveApp.getFileById(Utils.manager.dbID);

    refreshViewersAndEditors(dbFile, dbViewers, dbEditors);

    const logViewers = new Set();
    const logEditors = new Set([...admins, ...leaders, ...administration]);

    const logFile = DriveApp.getFileById(Utils.manager.logId);
    refreshViewersAndEditors(logFile, logViewers, logEditors);
}

/**
 * Corrects database permissions for all empoyees
 * @param {Object} employees object of all employees
 */
function correctDbProtections(employees) {
    var admins = filterByPermission_(employees, Utils.AccessEnums.ADMIN);
    var leaders = filterByPermission_(employees, Utils.AccessEnums.LEADER);
    var administration = filterByPermission_(employees, Utils.AccessEnums.ADMINISTRATIVE);
    var leadersSheets = ['Assistants', 'GroupActors', 'GroupLeaders', 'Tariffs', 'Clients', 'Triggers', 'GroupClients', 'Events', 'KeyStore'];
    var administrationSheets = ['Tariffs', 'KeyStore'];

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
