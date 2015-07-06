/**
 * Insert User(employee) into database
 * user has properties leadsGroups or isInGroups which are arrays and this function inserts them into diferent tables of database too
 *
 * @param user User(employee) object
 * @return {boolean} indicating success or failure.
 */
function createEmployee(user) { // *wrapper function: treats assistant and employee the same 
  var result;

  if (user.permission == AccessEnums.ASSISTANT || user.permission == null) {
    result = createAssistant_(user);
  } else {
    result = createEmployee_(user);
  }
  if (result) {
    result = result && refreshUserGroups_(user.leadsGroups, user.email, true);
    result = result && refreshUserGroups_(user.isInGroups, user.email, false);
  }

  return result;
}

/**
 * Delete User(employee)/s from database based on its properties.
 * Also deletes all groups user is in or leads
 
 * @param  user User(employee) object object
 * @return {boolean} indicating success or failure.
 */
function deleteEmployee(user) { // *wrapper function: treats assistant and employee the same 
  var result = deleteEmployee_(user) || deleteAssistant_(user);

  if (result) {
    if (isSuperAdmin()) {
      var site = SitesApp.getSiteByUrl(manager.site);
      site.removeViewer(user.email);
      site.removeEditor(user.email);
    }

    deleteGroupLeader({
      employeeEmail: user.email
    });
    deleteGroupActor({
      employeeEmail: user.email
    });
  }
  return result;
}

/**
 * Finds users(employees) from database based on restrictions 
 * returns them with groups user leads or is in
 *
 * @param fields fields is array of strings . It assigns these strings as properties to final objects
 * @param restrictions object of key/value pairs for selecting rows
 * @return array of users(employees)
 */
function findEmployees(fields, restrictions) {
  var rows = findEmployees_(fields, restrictions);
  var rows2 = [];
  var leadsGroups = findGroupLeaders();
  var isInGroups = findGroupActors();

  if (restrictions == null || restrictions.permission == null || restrictions.permission == AccessEnums.ASSISTANT) {
    rows2 = findAssistants_(fields, restrictions);
  }

  if (!fields || fields.length == 0 || fields.indexOf('permission') > -1) { // resolve permissions for assistants
    for (var i = 0; i < rows2.length; i++) {
      rows2[i].permission = AccessEnums.ASSISTANT;
    }
  }

  rows.push.apply(rows, rows2);

  for (var i = 0; i < rows.length; i++) { // resolve groups for everyone
    var leads = leadsGroups.filter(function(item) {
      return item.employeeEmail === rows[i].email;
    });
    var isIn = isInGroups.filter(function(item) {
      return item.employeeEmail === rows[i].email;
    });

    rows[i].leadsGroups = convertObjectsToArrayByProperty(leads, 'group');
    rows[i].isInGroups = convertObjectsToArrayByProperty(isIn, 'group');;
  }

  return rows;
}

/**
 * Updates User(employee)/s from database based on its properties
 * We can choose by property isUpdatable = false that we don't want to update user
 * Updates groups user is in and leads every time
 *
 * @param user User(employee) object with property email as id
 * @return {boolean} indicating success or failure.
 */
function updateEmployee(user) {
  var result = true;
  var isAssistant = findAssistants_([], {
    email: user.email
  }).length == 1;
  var isAssistantPermission = user.permission == AccessEnums.ASSISTANT;
  var email = user.email;

  if (user.isUpdatable == null || user.isUpdatable) {
    if (isAssistantPermission == isAssistant) {
      result = updateEmployee_(user) || updateAssistant_(user);
    } else if (isAssistantPermission) {
      result = deleteEmployee_({
        email: email
      });
      result = result && createAssistant_(user);
      result = result && deleteGroupLeader({employeeEmail: email}, true);
    } else {
      result = deleteAssistant_({
        email: email
      });
      result = result && createEmployee_(user);
    }
  }

  result = result && refreshUserGroups_(user.leadsGroups, email, true);
  result = result && refreshUserGroups_(user.isInGroups, email, false);

  return result;
}

/**
 * Refreshes information about groups which is user in or leads
 *
 * @param groups groups with attributes
 * @param email email of user
 * @param groupLeader if true refresh group leads, group is in otherwise
 * @return {boolean} indicating success or failure.
 */
function refreshUserGroups_(groups, email, groupLeader) {
  var result = true;

  for (var i = 0; i < groups.length; i++) {
    if (groups[i].isUpdatable) {
      if (groups[i].isInDb) {
        if (groupLeader) {
          result = result && deleteGroupLeader({
            employeeEmail: email,
            group: groups[i].group
          });
        } else {
          result = result && deleteGroupActor({
            employeeEmail: email,
            group: groups[i].group
          });
        }
      } else {
        if (groupLeader) {
          result = result && createGroupLeader({
            employeeEmail: email,
            group: groups[i].group
          });
        } else {
          result = result && createGroupActor({
            employeeEmail: email,
            group: groups[i].group
          });
        }
      }
    }

  }
  return result;
}
