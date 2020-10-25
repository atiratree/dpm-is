/**
 * Insert Group Leader into database
 *
 * @param groupLeader object
 * @return {boolean} indicating success or failure.
 */
function createGroupLeader(groupLeader) {
  return repCreate_(manager.groupLeadSh, groupLeader);
}

/**
 * Delete group Leader/s from database based on its properties
 *
 * @param groupLeader object
 * @param hasMoreInstances  if true turns off error logging if object has more instances 
 * @return {boolean} indicating success or failure.
 */
function deleteGroupLeader(groupLeader, hasMoreInstances) {
  return repDelete_(manager.groupLeadSh, groupLeader, hasMoreInstances);
}

/**
 * Updates group Leader/s from database based on its properties
 *
 * @param oldGroupLeader to use for selection of an update
 * @param groupLeader update object
 * @return {boolean} indicating success or failure.
 */
function updateGroupLeader(oldGroupLeader, groupLeader) {
  return repUpdate_(manager.groupLeadSh, groupLeader, oldGroupLeader);
}

/**
 * Finds group Leaders from database based on restrictions 
 *
 * @param fields fields is array of strings . It assigns these strings as properties to final objects
 * @param restrictions object key/value pairs for selecting rows
 * @return {Array<Object>} array of group leaders
 */
function findGroupLeaders(fields, restrictions) {
  return repFind_(manager.groupLeadSh, fields, restrictions);
}

/**
 * Insert Group Actor into database
 *
 * @param groupActor object
 * @return {boolean} indicating success or failure.
 */
function createGroupActor(groupActor) {
  return repCreate_(manager.groupActSh, groupActor);
}

/**
 * Delete group Actor/s from database based on its properties
 *
 * @param  groupActor object
 * @param hasMoreInstances  if true turns off error logging if object has more instances 
 * @return {boolean} indicating success or failure.
 */
function deleteGroupActor(groupActor, hasMoreInstances) {
  return repDelete_(manager.groupActSh, groupActor, hasMoreInstances);
}

/**
 * Updates group Actor/s from database based on its properties
 *
 * @param oldGroupActor to use for selection of an update
 * @param groupActor update object
 * @return {boolean} indicating success or failure.
 */
function updateGroupActor(oldGroupActor, groupActor) {
  return repUpdate_(manager.groupActSh, groupActor, oldGroupActor);
}

/**
 * Finds group Actors from database based on restrictions 
 *
 * @param fields fields is array of strings . It assigns these strings as properties to final objects
 * @param restrictions object key/value pairs for selecting rows
 * @return {Array<Object>} array of group Actors
 */
function findGroupActors(fields, restrictions) {
  return repFind_(manager.groupActSh, fields, restrictions);
}

/**
 * Insert Group Client into database
 *
 * @param groupClient object
 * @return {boolean} indicating success or failure.
 */
function createGroupClient(groupClient) {
  return repCreate_(manager.groupClsSh, groupClient);
}

/**
 * Delete group Client/s from database based on its properties
 *
 * @param groupClient object
 * @param hasMoreInstances  if true turns off error logging if object has more instances 
 * @return {boolean} indicating success or failure.
 */
function deleteGroupClient(groupClient, hasMoreInstances) {
  return repDelete_(manager.groupClsSh, groupClient, hasMoreInstances);
}

/**
 * Updates group Client/s from database based on its properties
 *
 * @param oldGroupClient to use for selection of an update
 * @param groupClient update object
 * @return {boolean} indicating success or failure.
 */
function updateGroupClient(oldGroupClient, groupClient) {
  return repUpdate_(manager.groupClsSh, groupClient, oldGroupClient);
}

/**
 * Finds group Clients from database based on restrictions 
 *
 * @param fields fields is array of strings . It assigns these strings as properties to final objects
 * @param restrictions object key/value pairs for selecting rows
 * @return {Array<Object>} array of group Clients
 */
function findGroupClients(fields, restrictions) {
  return repFind_(manager.groupClsSh, fields, restrictions);
}

/**
 * Insert Event into database
 *
 * @param groupActor object
 * @return {boolean} indicating success or failure.
 */
function createEvent(event) {
  return repCreate_(manager.eventSh, event);
}

/**
 * Delete Event/s from database based on its properties
 *
 * @param  groupActor object
 * @param hasMoreInstances  if true turns off error logging if object has more instances 
 * @return {boolean} indicating success or failure.
 */
function deleteEvent(event, hasMoreInstances) {
  return repDelete_(manager.eventSh, event, hasMoreInstances);
}

/**
 * Finds Events from database based on restrictions 
 *
 * @param fields fields is array of strings . It assigns these strings as properties to final objects
 * @param restrictions object key/value pairs for selecting rows
 * @return {Array<Object>} array of group Events
 */
function findEvents(fields, restrictions) {
  return repFind_(manager.eventSh, fields, restrictions);
}
