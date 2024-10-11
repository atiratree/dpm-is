/**
 * Gets active User email.
 *
 * @return {string} email of active User.
 */
function getUserEmail() {
  return Session.getActiveUser().getEmail();
}

/**
 * Checks if email is main admin or if active user is (in case email == null).
 *
 * @param email email to be checked or null to check active user
 * @return {boolean} true if is main admin.
 */
function isMainAdmin(email) {
  return manager.superAdminEmail === (email ? email : getUserEmail());
}

/**
 * Finds user permission of email or active user (in case email == null).
 *
 * @param email email to be checked or falsy value to check active user
 * @return {number} user permission
 */
function getUserPermission(email) {
  var userPermission;

  if (!email) {
      email = getUserEmail();
  }

  userPermission = findAssistants_(['email'], {
    email: email
  }, 1).length == 1 ? AccessEnums.ASSISTANT : findEmployees_(['permission'], {
    email: email
  }, 1).shift();

  if (typeof userPermission === 'object') {
    userPermission = userPermission.permission;
  }

  if (userPermission == null || isNaN(userPermission)) {
    logError('Error : No permission/access');
    throw {
      message: 'Error : No permission/access'
    }
  }

  return parseInt(userPermission, 10);
}

/**
 * Checks if active user has access to at least one of resource (specified as accessEnum).
 *
 * @param accessEnumArray resources array to find access for
 * @param permissionType Type of permission for resource we need to know
 * @return {boolean} true if has access, false otherwise
 */
function hasAccessToSomeOf(accessEnumArray, permissionType) {
  if (accessEnumArray == null || !Array.isArray(accessEnumArray) || permissionType == null) {
    return false;
  }

  var rights = getMyAccessRights(permissionType);
  var result = false;

  for (var i = 0; i < accessEnumArray.length; i++) {
    if (rights.indexOf(accessEnumArray[i]) > -1) {
      result = true;
      break;
    }
  }

  return result;
}

/**
 * Checks if active user has access to resource (specified as accessEnum).
 *
 * @param accessEnum resource we need to have access
 * @param permissionType Type of permission for resource we need to know
 * @return {boolean} true if has access, false otherwise
 */
function hasAccessTo(accessEnum, permissionType) {
  if (accessEnum == null || permissionType == null) {
    return false;
  }

  return getMyAccessRights(permissionType).indexOf(accessEnum) > -1;
}

/**
 * Returns all Accesses current user is possesing for permission type.
 *
 * @param type Permission Type  to find
 * @return {Array<number>} array of accessable resources
 */
function getMyAccessRights(type) {
  var userPerm;

  try {
    userPerm = getUserPermission();
  } catch(ignored) {
    return [];
  }

  var fullRights = [
    AccessEnums.ADMIN,
    AccessEnums.LEADER,
    AccessEnums.ADMINISTRATIVE,
    AccessEnums.ASSISTANT,
    AccessEnums.CLIENT_OR_EVENT,
    AccessEnums.TARIFF,
    AccessEnums.EMPLOYEE,
    AccessEnums.EMPLOYEES_GROUPS,
    AccessEnums.GROUP,
    AccessEnums.GROUP_UPDATE,
    AccessEnums.SCHEDULE,
    AccessEnums.CLIENT,
    AccessEnums.EVENT,
    AccessEnums.EMAIL_SENDER
  ];

  switch (userPerm) {
    case AccessEnums.ADMIN:
      return fullRights;

    case AccessEnums.ASSISTANT:
      switch (type) {
        case PermissionTypes.VIEW:
          return [AccessEnums.EMPLOYEE];
      }
      break;

    case AccessEnums.LEADER:
      switch (type) {
        case PermissionTypes.VIEW:
          return fullRights;
        case PermissionTypes.EDIT:
          return [AccessEnums.ASSISTANT, AccessEnums.EMPLOYEES_GROUPS, AccessEnums.CLIENT, AccessEnums.EVENT, AccessEnums.TARIFF, AccessEnums.EMAIL_SENDER];
      }
      break;

    case AccessEnums.ADMINISTRATIVE:
      switch (type) {
        case PermissionTypes.VIEW:
          return fullRights;
        case PermissionTypes.EDIT:
          return [AccessEnums.TARIFF];
      }
      break;
  }

  return [];
}

/**
 * Returns names and permission of all users roles active user can edit and create
 *
 * @return {Array<Object>} array of permissions with names in Czech
 */
function getMyAccessRightsNames() {
  var result = [];
  var IDs = this.getMyAccessRights(PermissionTypes.EDIT);
  var rows = getUserRolesInCzech();

  for (var i = rows.length - 1; i >= 0; i--) {
    for (var j = 0; j < IDs.length; j++) {
      if (IDs[j] === rows[i].permission) {
        result.push({
          permission: rows[i].permission,
          name: rows[i].name
        });
      }
    }
  }

  return result;
}

/**
 * Finds all existing groups and adds attributes for adding other users to those groups by user/client or active user (in case user == null).
 *
 * @param user user/client to be checked or null to check active user
 * @return {Array<Object>} array of groups with editing attributes
 */
function getMyGroupsWithEditAtrs(user) {
  var groups, permission, myEmail, groupLeaders;

  // permission attrs exists even for inactive groups
  groups = findGroups();
  permission = getUserPermission();
  myEmail = getUserEmail();
  groupLeaders = convertObjectsToArrayByProperty(findGroupLeaders(['group'], {
    employeeEmail: myEmail
  }), 'group');

  return groups.map(function(item) {
    item.editable = false;

    if (permission == AccessEnums.ADMIN) {
      item.editable = true;
    } else if (permission == AccessEnums.LEADER && !(user && myEmail === user.email)) {
      item.editable = groupLeaders.indexOf(item.group) > -1;
    }

    item.leadsGroup = user ? user.leadsGroups && user.leadsGroups.indexOf(item.group) > -1 : false;
    item.isInGroup = user ? user.isInGroups && user.isInGroups.indexOf(item.group) > -1 : false;
    return item;
  });
}

/**
 * @param groupsWithEditAttrs cached groupsWithEditAttrs
 * @param fileId id of Rozpis SpreadSheet
 * @return true if a user can edit file with this fileId
 */
function canEditFile(groupsWithEditAttrs, fileId){
  try {
    var sheetRecord = findFiles(['group'], {
      id: fileId
    },1)[0];
    if (sheetRecord) {
      var group = sheetRecord.group;

      var groupEditAttributes = groupsWithEditAttrs.filter(function(item) {
        return item.group === group;
      })[0];

      return !!(groupEditAttributes && groupEditAttributes.editable);
    }

    return false;
  } catch (x) {
    logError(x);
    return false;
  }
}
