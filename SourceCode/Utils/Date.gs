/**
 * This script is released to the public domain and may be used, modified and distributed without restrictions. Attribution not necessary but appreciated.
 * 
 * Source: http://weeknumber.net/how-to/javascript 
 * Returns the ISO week of the date.
 *
 * @param dateObj Date
 * @return number of week of dateObj
 */
function getWeekNumber(dateObj) {
  var date = new Date(dateObj.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  // January 4 is always in week 1.
  var week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

/**
 * Roll backs by number of weeks.
 *
 * @param day year part is parsed from it
 * @param week week
 * @param numberOfWeeksBack number of weeks to roll back
 * @return object {year:year,week:week} of rolled back date
 */
function getOlderWeek(day, week, numberOfWeeksBack) {
  return getOlderWeekRecursive_(day.getFullYear(), week - numberOfWeeksBack);
}

/**
 * Checks if today is monday or returns last monday.
 *
 * @param day Date
 * @return monday Date
 */
function getMonday(day) {
  var retDay = new Date(day);
  var weekday = day.getDay();

  if (weekday != 1) {
    if (weekday == 0) {
      retDay.setDate(day.getDate() - 6);
    } else {
      retDay.setDate(day.getDate() - weekday + 1);
    }
  }
  retDay.setHours(0, 0, 0);
  return retDay;
}

/**
 * Returns next monday.
 *
 * @param monday Date
 * @return monday Date
 */
function getNextMonday(monday) {
  var retDay = new Date(monday);
  retDay.setDate(monday.getDate() + 7);
  retDay.setHours(0, 0, 0);
  return retDay;
}

/**
 * Returns This week's Sunday.
 *
 * @param monday Date
 * @return sunday Date
 */
function getThisWeeksSunday(monday) {
  var retDay = new Date(monday);
  retDay.setDate(monday.getDate() + 6);
  retDay.setHours(0, 0, 0);
  return retDay;
}

/**
 * Compares dates between first and second and returns difference
 *
 * @param first Date
 * @param second Date
 * @return negative value if first is larger than second
 */
function compareDates(first, second) {
  var d1 = new Date(first);
  var d2 = new Date(second);

  return d2.setHours(0, 0, 0, 0) - d1.setHours(0, 0, 0, 0);
}

/**
 * Compares times of Dates between first and second and returns difference
 *
 * @param first Date
 * @param second Date
 * @return negative value if first is larger than second
 */
function compareTimes(first, second) {
  var d1 = new Date(first);
  var d2 = new Date(second);

  return d2 - d1;
}

/**
 * Returns formatted date
 *
 * @param date Date
 * @differentType if true uses . , otherwise - as separator
 * @return formatted date as string
 */
function getFormatedDate(date, differentType) {
  var d = date.getDate();
  var m = date.getMonth() + 1;
  var y = date.getFullYear();

  return differentType ? d + '. ' + m + '. ' + y : m + '-' + d + '-' + y;
}

/**
 * @private
 */
function getOlderWeekRecursive_(year, week) {
  if (week < 1) {
    year -= 1;
    week += getNumberOfWeeksInYear_(year);
    return getOlderWeekRecursive(year, week);
  } else {
    return {
      year: year,
      week: week
    }
  }
}

/**
 * @private
 */
function getNumberOfWeeksInYear_(year) {
  var day = new Date(year, 11, 31);
  var week = getWeekNumber(day);
  day.setDate(24);
  return week == 1 ? getWeekNumber(day) : week;
}

/**
 * @return array of ordered string of months in Czech language 
 */
function getMonthsNames() {
  return ['Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'];
}

/**
 * @return array of ordered string of days in week(starting on monday) in Czech language 
 */
function getWeekDaysNames() {
  return ['Pondělí', 'Uterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota', 'Neděle'];
}
