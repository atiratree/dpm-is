/**
 * Insert Object to database
 *
 * @param {string} sheet sheet/table where the object will be stored
 * @param obj object with key/value  pairs that will be inserted to database
 * @return {boolean} indicating success or failure.
 */
function repCreate_(sheet, obj) {
  if (sheet == null || obj == null) return false;

  lock_()
  var num = objDB.insertRow(manager.myDB, sheet, obj);
  unlock_();

  if (num) {
    var name = obj.name ? obj.name : JSON.stringify(obj);
    log(name + ' added to ' + sheet);
  }
  return num > 0;
}

/**
 * Deletes Object in database
 *
 * @param {string} sheet sheet/table from which the object will be removed
 * @param obj object with key/value  pairs that will be removed from database
 * @param {boolean} hasMoreInstances indicates whether deleted object can have more instances for deletion
 * @return {boolean} indicating success or failure.
 */
function repDelete_(sheet, obj, hasMoreInstances) {
  if (sheet == null || obj == null) return false;

  lock_();
  var num = objDB.deleteRow(manager.myDB, sheet, obj);
  unlock_();

  if (num) {
    var name = obj.name ? obj.name : JSON.stringify(obj);
    log(name + ' deleted from ' + sheet);
  }
  if (num > 1 && !hasMoreInstances) {
    logError('Error : deleted ' + num + ' instances of: ' + name + ' in ' + sheet);
  }

  return num > 0;
}

/**
 * Updates Object in database
 *
 * @param {string} sheet sheet/table where the object is stored
 * @param obj object with key/value  pairs that will be updated in database
 * @param cond object with key/value  pairs that will be used to find columns of database which will be replaced
 * @return {boolean} indicating success or failure.
 */
function repUpdate_(sheet, obj, cond) {
  if (sheet == null || obj == null || cond == null) return false;

  lock_();
  var num = objDB.updateRow(manager.myDB, sheet, obj, cond);
  unlock_();

  if (num) {
    var cond = cond.name ? cond.name : JSON.stringify(cond);
    log(cond + ' updated to ' + JSON.stringify(obj) + ' in ' + sheet);
  }
  if (num > 1) {
    logError('Error : updated ' + num + ' instances of:' + cond + ' in ' + sheet);
  }

  return num > 0;
}

/**
 * Returns objects from database
 *
 * @param {string} sheet sheet/table where the object is stored
 * @param fields array with strings of columns we want to have returned, if empty array it can return undefined properties for no data in property
 * @param restrictions object with key/value  pairs that will be used for filtering columns of database
 * @param limit maximum number of objects function returns
 * @return array of found objects
 */
function repFind_(sheet, fields, restrictions, limit) {
  if (sheet == null) return [];

  if (!(fields instanceof Array)) {
    fields = [];
  }
  if (restrictions == null) {
    restrictions = {};
  }

  lock_();
  var rows = objDB.getRows(manager.myDB, sheet, fields, restrictions, limit);
  unlock_();

  if (fields.length > 0) {
    rows = rows.map(function(item) {
      for (var i = 0; i < fields.length; i++) {
        if (item[fields[i]] === undefined) {
          item[fields[i]] = '';
        }
      }
      return item;
    });
  }

  return rows;
}
