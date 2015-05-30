/**
 * Processes data for Awesome Table Gadget.
 * This function is expected to be called from this gadget, if called from different sources then shows authorization confirmation.
 *
 * @param e passed parameters from Awesome Table Gadget, or no parameter for showing authorization confirmation
 * @return object with data for Awesome Table Gadget or shows auth message
 */
function doGet(e) {
  var ret = {};

  if (!e.parameter.sheet) {
    return HtmlService.createTemplate('<p>Authorizace...OK</span></p>').evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME);
  }

  try {
    switch (e.parameter.sheet) {
      case 'Clients':
        ret = getClientsTable();
        break;
      case 'Events':
        ret = getEventsTable();
        break;
      case 'Employees':
        ret = getEmployeesTable();
        break;
      case 'Tariffs':
        ret = getTariffsTable();
        break;
      case 'Groups':
        ret = getGroupsTable();
        break;
    }

    var output = e.parameters.callback + '(' + JSON.stringify({
      dataTable: ret
    }) + ')';

    return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JAVASCRIPT);
  } catch (e) {
    Utils.logError(e);
  }
}
