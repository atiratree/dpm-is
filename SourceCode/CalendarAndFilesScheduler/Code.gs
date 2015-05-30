var numberOfWeeksToAdd = 12;
/*
 * automatic script which reloads calendar and creates missing Schedule Sheets
 */
function runOnceAWeek() {
  run_(true);
}

/*
 * automatic script which creates missing Schedule Sheets
 */
function runEverySixHours() {
  run_(false);
}

/*
 * not automatic
 */
function refreshAll() {
  run_(true);
  runEveryTwoHours()
}

/*
 * automatic script which refreshes rights for Sheets and Sites
 */
function runEveryTwoHours() {
  try {
    var employees = Utils.findEmployees(['email', 'permission']);
    correctDbProtections(employees);
    correctProtections();
    correctSitesRights(employees);
    Utils.log('Corrected protections.');
  } catch (e) {
    Utils.logError(e);
    throw e;
  }
}

function run_(updateCalendar) {
  try {
    Utils.log((updateCalendar ? 'Calendar and ' : '') + 'Spreadsheet updater executed');
    var day = new Date();
    var data = {
      files: Utils.findFiles(),
      groups: Utils.findGroupsAsArray()
    };
    var numberOWeeksToRefresh = numberOfWeeksToAdd + 1; // 1 is this week
    var till;
    var week;

    day = Utils.getMonday(day);
    till = Utils.getThisWeeksSunday(day);
    week = Utils.getWeekNumber(day);

    while (numberOWeeksToRefresh > 0) {
      if (updateCalendar) {
        refreshCalendar(day, till, week);
      }

      refreshSpreadSheet(day, week, data);

      day = Utils.getNextMonday(day);
      till = Utils.getThisWeeksSunday(day);
      week = Utils.getWeekNumber(day);
      numberOWeeksToRefresh--;
    }
  } catch (e) {
    Utils.logError(e);
    throw e;
  }
}
