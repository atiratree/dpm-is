/**
 * Insert Assistant into database
 *
 * @param assistant object
 * @return {boolean} indicating success or failure.
 */
function createAssistant_(assistant) {
  return repCreate_(manager.assistSh, assistant);
}

/**
 * Delete assistant/s from database based on its properties
 *
 * @param assistant object
 * @return {boolean} indicating success or failure.
 */
function deleteAssistant_(assistant) {
  return repDelete_(manager.assistSh, assistant);
}

/**
 * Updates assistant/s from database based on its properties
 *
 * @param assistant object with email property as id
 * @return {boolean} indicating success or failure.
 */
function updateAssistant_(assistant) {
  return repUpdate_(manager.assistSh, assistant, {
    email: assistant.email
  });
}

/**
 * Finds assistants from database based on restrictions 
 *
 * @param fields fields is array of strings . It assigns these strings as properties to final objects
 * @param restrictions object of key/value pairs for selecting rows
 * @param limit maximum number of rows to be returned
 * @return array of assistants
 */
function findAssistants_(fields, restrictions, limit) {
  return repFind_(manager.assistSh, fields, restrictions, limit);
}

/**
 * Insert Employee into database
 *
 * @param employee object
 * @return {boolean} indicating success or failure.
 */
function createEmployee_(employee) {
  return repCreate_(manager.employSh, employee);
}

/**
 * Delete employee/s from database based on its properties
 *
 * @param employee object
 * @return {boolean} indicating success or failure.
 */
function deleteEmployee_(employee) {
  return repDelete_(manager.employSh, employee);
}

/**
 * Updates employee/s from database based on its properties
 *
 * @param employee object with email property as id
 * @return {boolean} indicating success or failure.
 */
function updateEmployee_(employee) {
  return repUpdate_(manager.employSh, employee, {
    email: employee.email
  });
}

/**
 * Finds employees from database based on restrictions 
 *
 * @param fields fields is array of strings . It assigns these strings as properties to final objects
 * @param restrictions object of key/value pairs for selecting rows
 * @param limit maximum number of rows to be returned
 * @return array of employees
 */
function findEmployees_(fields, restrictions, limit) {
  return repFind_(manager.employSh, fields, restrictions, limit);
}

/**
 * Insert Client into database
 *
 * @param client object
 * @return {boolean} indicating success or failure.
 */
function createClient(client) {
  var result = repCreate_(manager.clientsSh, client);

  if (result) {
    result = result && refreshClientGroups_(client.isInGroups, client.name);
  }

  return result;
}

/**
 * Delete client/s from database based on its properties
 *
 * @param client object
 * @return {boolean} indicating success or failure.
 */
function deleteClient(client) {
  var result = repDelete_(manager.clientsSh, client);

  deleteGroupClient({
    name: client.name
  }, true);

  return result;
}

/**
 * Updates client/s from database based on its properties
 *
 * @param client object with name property as id
 * @return {boolean} indicating success or failure.
 */
function updateClient(client) {
  var result = true;

  if (client.isUpdatable == null || client.isUpdatable) {
    result = repUpdate_(manager.clientsSh, client, {
      name: client.name
    });
  }

  result = result && refreshClientGroups_(client.isInGroups, client.name);

  return result;
}

/**
 * Finds clients from database based on restrictions 
 *
 * @param fields fields is array of strings . It assigns these strings as properties to final objects
 * @param restrictions object of key/value pairs for selecting rows
 * @return array of clients
 */
function findClients(fields, restrictions) {
  var isInGroups = findGroupClients();
  var rows;

  rows = repFind_(manager.clientsSh, fields, restrictions);

  for (var i = 0; i < rows.length; i++) {
    var isIn = isInGroups.filter(function(item) {
      return item.name === rows[i].name;
    });

    rows[i].isInGroups = convertObjectsToArrayByProperty(isIn, 'group');;
  }

  return rows;
}

/**
 * Insert Tariff into database
 *
 * @param tariff object
 * @return {boolean} indicating success or failure.
 */
function createTariff(tariff) {
  return repCreate_(manager.tariffsSh, tariff);
}

/**
 * Delete tariff/s from database based on its properties
 *
 * @param tariff object
 * @return {boolean} indicating success or failure.
 */
function deleteTariff(tariff) {
  return repDelete_(manager.tariffsSh, tariff);
}

/**
 * Updates tariff/s from database based on its properties
 *
 * @param tariff object with shortcut property as id
 * @return {boolean} indicating success or failure.
 */
function updateTariff(tariff) {
  return repUpdate_(manager.tariffsSh, tariff, {
    shortcut: tariff.shortcut
  });
}

/**
 * Finds tariffs from database based on restrictions 
 *
 * @param fields fields is array of strings . It assigns these strings as properties to final objects
 * @param restrictions object of key/value pairs for selecting rows
 * @return array of tariffs
 */
function findTariffs(fields, restrictions) {
  return repFind_(manager.tariffsSh, fields, restrictions);
}

function refreshClientGroups_(groups, name) {
  var result = true;

  for (var i = 0; i < groups.length; i++) {
    if (groups[i].isUpdatable) {
      if (groups[i].isInDb) {
        result = result && deleteGroupClient({
          name: name,
          group: groups[i].group
        });
      } else {
        result = result && createGroupClient({
          name: name,
          group: groups[i].group
        });
      }
    }

  }
  return result;
}
