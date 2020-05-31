/**
 * Insert Group into database
 *
 * @param group object
 * @return {boolean} indicating success or failure.
 */
function createGroup(group) {
  return repCreate_(manager.groupsSh, group);
}

/**
 * Delete group/s from database based on its properties
 *
 * @param group object
 * @return {boolean} indicating success or failure.
 */
function deleteGroup(group) {
  return repDelete_(manager.groupsSh, group);
}

/**
 * Finds groups from database based on restrictions 
 *
 * @param restrictions object of key/value pairs for selecting rows
 * @param limit maximum number of rows to be returned
 * @return {Array<Object>} array of groups
 */
function findGroups(restrictions, limit) {
  return repFind_(manager.groupsSh, [], restrictions, limit);
}

/** 
 * @return {Array<Object>} all groups as array
 */
function findGroupsAsArray() {
  return convertObjectsToArrayByProperty(findGroups(), 'group');
}

/**
 * Insert file into database with current time 
 *
 * @param file object
 * @return {boolean} indicating success or failure.
 */
function createFile(file) {
  file.created = new Date().toISOString();

  return repCreate_(manager.filesSh, file);
}

/**
 * Delete file/s from database based on its properties
 * Moves file to trash in Google Drive
 *
 * @param file object
 * @return {boolean} indicating success or failure.
 */
function deleteFile(file) {
  DriveApp.getFileById(file.id).setTrashed(true);

  return repDelete_(manager.filesSh, file);
}

/**
 * Updates file/s from database based on its properties
 *
 * @param file object with property id
 * @return {boolean} indicating success or failure.
 */
function updateFile(file) {
  return repUpdate_(manager.filesSh, file, {
    id: file.id
  });
}

/**
 * Finds files from database based on restrictions 
 *
 * @param fields fields is array of strings . It assigns these strings as properties to final objects
 * @param restrictions object of key/value pairs for selecting rows
 * @param limit maximum number of rows to be returned
 * @return {Array<Object>} array of files
 */
function findFiles(fields, restrictions, limit) {
  return repFind_(manager.filesSh, fields, restrictions, limit);
}

/**
 * Insert Trigger into database and sets emailSequence for trigger.email as increment of the last greatest one for this user
 *
 * @param trigger trigger with email property
 * @return {boolean} indicating success or failure.
 */
function createTrigger(trigger) {
  lock_();
  try {
    var highestSequence = 0; // 0 .. no triggers installed
    var triggers = objDB.getRows(manager.myDB, manager.trigSh, ['emailSequence'], {
      email: trigger.email
    });

    triggers.forEach(function(item) {
      if (item.emailSequence > highestSequence) {
        highestSequence = item.emailSequence;
      }
    });

    trigger.emailSequence = highestSequence + 1;

    var num = objDB.insertRow(manager.myDB, manager.trigSh, trigger);

    if (num) {
      log(trigger.emailSequence + ' ' + trigger.email  + ' added to ' + manager.trigSh);
    }
  } finally {
    unlock_();
  }
}

/**
 * Delete trigger/s from database based on its properties
 *
 * @param trigger object
 * @param hasMoreInstances  if true turns off error logging if object has more instances 
 * @return {boolean} indicating success or failure.
 */
function deleteTrigger(trigger, hasMoreInstances) {
  return repDelete_(manager.trigSh, trigger, hasMoreInstances);
}

/**
 * Updates trigger/s from database based on its properties
 *
 * @param trigger object with property id
 * @return {boolean} indicating success or failure.
 */
function updateTrigger(trigger) {
  return repUpdate_(manager.trigSh, trigger, {
    id: trigger.id
  });
}

/**
 * Finds triggers from database based on restrictions 
 *
 * @param fields fields is array of strings . It assigns these strings as properties to final objects
 * @param restrictions object of key/value pairs for selecting rows
 * @param limit maximum number of rows to be returned
 * @return {Array<Object>} array of triggers
 */
function findTriggers(fields, restrictions, limit) {
  return repFind_(manager.trigSh, fields, restrictions, limit);
}
