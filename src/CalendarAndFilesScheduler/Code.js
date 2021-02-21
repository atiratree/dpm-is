const numberOfWeeksToAdd = 12;
/**
 * automatic script which reloads calendar and creates missing Schedule Sheets
 */
function runOnceAWeek() {
  run_(true);
}

/**
 * automatic script which creates missing Schedule Sheets
 */
function runEverySixHours() {
  run_(false);
}

/**
 * not automatic
 */
function refreshAll() {
  run_(true);
  runEveryTwoHours();
}

/**
 * automatic script which refreshes rights for Sheets and Sites
 */
function runEveryTwoHours() {
  try {
    var employees = Utils.findEmployees(['email', 'permission']);
    correctDBandLogFileProtections(employees);
    Utils.logCorrection('Corrected DB and Log File protections.');
    correctDbProtections(employees);
    Utils.logCorrection('Corrected DB protections.');
    correctProtections();
    Utils.logCorrection('Corrected SpreadSheet protections.');
    deleteOldTriggers();
  } catch (e) {
    Utils.logError(e);
    throw e;
  }
}

function run_(updateCalendar) {
  try {
    Utils.logCorrection((updateCalendar ? 'Calendar and ' : '') + 'Spreadsheet updater executed');
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

/**
 * deletes old triggers of not active users
 */
function deleteOldTriggers(){
  try {
    var users = Utils.convertObjectsToArrayByProperty(Utils.findEmployees(['email']), 'email');
    var triggers = Utils.convertObjectsToArrayByProperty(Utils.findTriggers(['email']), 'email');
    triggers = Utils.toUniquePrimitiveArray(triggers);

    triggers.forEach(function(trig){
      if(users.indexOf(trig)  < 0){
        Utils.deleteTrigger({email: trig}, true)
      }
    });
  } catch (e) {
    Utils.logError(e);
    // not critical error for re-throwing
  }
}
