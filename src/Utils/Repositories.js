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
 * @return {Array<Object>} array of assistants
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
 * @return {Array<Object>} array of employees
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
  let result = repDelete_(manager.clientsSh, client);

  const oldGroupClients = findGroupClients([],{
    name: client.name,
  })

  for (var i = 0; i < oldGroupClients.length; i++) {
    let groupClientUpdate = Object.assign({}, oldGroupClients[i], { status: 'inactive' });
    result = result && updateGroupClient(oldGroupClients[i], groupClientUpdate);
  }

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
 * Finds clients from database based on restrictions,
 * each client has attribute with his groups if includeIsInGroups is true
 *
 * @param fields fields is array of strings . It assigns these strings as properties to final objects
 * @param restrictions object of key/value pairs for selecting rows
 * @param includeIsInGroups if true adds isInGroups attribute to each client
 * @return {Array<Object>} array of clients
 */
function findClients(fields, restrictions, includeIsInGroups) {
  let rows = repFind_(manager.clientsSh, fields, restrictions);
  if (!includeIsInGroups) {
    return rows;
  }

  // ignore inactive associations
  const isInGroups = findGroupClients([], {status: 'active'});
  const groups = findGroups(['group'], {status: 'active'});
  const activeGroupSet = new Set([...convertObjectsToArrayByProperty(groups, 'group')]);
  for (let i = 0; i < rows.length; i++) {
    let isIn = isInGroups.filter(function(item) {
      if (!activeGroupSet.has(item.group)) {
        // the group is not active anymore -> filter out
        return false;
      }
      return item.name === rows[i].name;
    });

    rows[i].isInGroups = convertObjectsToArrayByProperty(isIn, 'group');
  }

  return rows;
}


/**
 * Finds clients from database based on restrictions and a group the clients belong to
 *
 * @param fields fields is array of strings . It assigns these strings as properties to final objects
 * @param restrictions object of key/value pairs for selecting rows
 * @param group group for selecting clients
 * @return {Array<Object>} array of clients
 */
function findClientsByGroup(fields, restrictions, group) {
  // Allow inactive associations, since this is called only from EmailSender. If the SS exists, we should be able to send an email
  const clientsInGroup = findGroupClients([], {group: group});
  const clientsInGroupSet = new Set([...convertObjectsToArrayByProperty(clientsInGroup, 'name')]);

  return repFind_(manager.clientsSh, fields, restrictions).filter(function(item) {
    return clientsInGroupSet.has(item.name);
  });
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
 * @return {Array<Object>} array of tariffs
 */
function findTariffs(fields, restrictions) {
  return repFind_(manager.tariffsSh, fields, restrictions);
}

function refreshClientGroups_(groups, name) {
  var result = true;

  for (var i = 0; i < groups.length; i++) {
    if (!groups[i].isUpdatable) {
      continue
    }
    let oldGroupClients = findGroupClients([],{
      name: name,
      group: groups[i].group,
    })
    const status = groups[i].deactivate ? 'inactive' : 'active';
    if (oldGroupClients.length > 0) {
      const groupClientUpdate = Object.assign({}, oldGroupClients[0], { status: status });
      result = result && updateGroupClient(oldGroupClients[0], groupClientUpdate);
    } else {
      result = result && createGroupClient({
        name: name,
        group: groups[i].group,
        status: status
      });
    }
  }
  return result;
}
