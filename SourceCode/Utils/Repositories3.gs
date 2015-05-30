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
 * Finds group Leaders from database based on restrictions 
 *
 * @param fields fields is array of strings . It assigns these strings as properties to final objects
 * @param restrictions object key/value pairs for selecting rows
 * @return array of group leaders
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
 * Finds group Actors from database based on restrictions 
 *
 * @param fields fields is array of strings . It assigns these strings as properties to final objects
 * @param restrictions object key/value pairs for selecting rows
 * @return array of group Actors
 */
function findGroupActors(fields, restrictions) {
  return repFind_(manager.groupActSh, fields, restrictions);
}

/**
 * Insert Group Client into database
 *
 * @param groupActor object
 * @return {boolean} indicating success or failure.
 */
function createGroupClient(groupClient) {
  return repCreate_(manager.groupClsSh, groupClient);
}

/**
 * Delete group Client/s from database based on its properties
 *
 * @param  groupActor object
 * @param hasMoreInstances  if true turns off error logging if object has more instances 
 * @return {boolean} indicating success or failure.
 */
function deleteGroupClient(groupClient, hasMoreInstances) {
  return repDelete_(manager.groupClsSh, groupClient, hasMoreInstances);
}

/**
 * Finds group Clients from database based on restrictions 
 *
 * @param fields fields is array of strings . It assigns these strings as properties to final objects
 * @param restrictions object key/value pairs for selecting rows
 * @return array of group Clients
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
 * @return array of group Events
 */
function findEvents(fields, restrictions) {
  return repFind_(manager.eventSh, fields, restrictions);
}
