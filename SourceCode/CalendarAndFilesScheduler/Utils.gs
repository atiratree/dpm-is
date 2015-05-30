/*
 * refreshes calendar events 
 *
 * @param day monday of week to be set in calendar
 * @param till end of week to be set in calendar
 * @param week week number to be set in calendar
 */
function refreshCalendar(day, till, week) {
  var calApp = CalendarApp.getCalendarById('domovpromne.cz_r3otuc5vovmcvu40a35ik8p6gk@group.calendar.google.com');
  var searchOption = 'Týden ' + week;
  var events = calApp.getEvents(day, till, {
    search: searchOption
  });
  if (events.length == 0) {
    var desc = '<a href="https://script.google.com/a/macros/domovpromne.cz/s/AKfycbzR_O1qVLz5V360merzlzYfSSnfN2TDdSO9-ZI9z44SQWl8fpEk/exec?week=' + week +
      '&year=' + day.getFullYear() + '">Rozvrh</a>';
    var ev = calApp.createEventFromDescription(searchOption + ' ' + Utils.getFormatedDate(day) + '-' + Utils.getFormatedDate(till));
    ev.setDescription(desc);
  }
}

/*
 * Refreshes protections. Deletes protections not existing in emails and sets all permissions in emails.
 *
 * @param protection protection object to be changed
 * @param emails emails of desired editors
 * @param week week number to be set in calendar
 */
function appplyProtections(protection, emails) {
  emails = Utils.toUniquePrimitiveArray(emails);

  if (protection.canDomainEdit()) {
    protection.setDomainEdit(false);
  }

  protection.getEditors().forEach(function(user) {
    var email = user.getEmail();
    var index = emails.indexOf(email);
    if (index > -1) {
      emails.splice(index, 1);
    } else {
      protection.removeEditor(email);
    }
  });

  emails.forEach(function(newActor) {
    try {
      protection.addEditor(newActor);
    } catch (e) {
      Utils.logError(e);
    }
  });
}

/*
 * Checks if obj is in DB. Uses cached files obj, because looking into the database all the time would be inefficient.
 *
 * @param files all files in db
 * @param obj Object to be checked for
 * @return true if is in DB
 */
function isFileInDB(files, obj) { // faster then calling db to do this
  for (var i = 0; i < files.length; i++) {
    if (files[i].year == obj.year && files[i].week == obj.week && files[i].group == obj.group && files[i].type === obj.type) {
      if ((!files[i].owner && !obj.owner) || (files[i].owner === obj.owner)) {
        return true;
      }
    }
  }
  return false;
}
