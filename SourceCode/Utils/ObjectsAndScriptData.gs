/* Manager for storing important data scripts might need*/
var manager = {
  dbID: getScriptProp_('DatabaseSSid'), // used in TableScript
  timetablesID: getScriptProp_('TimetablesID'),
  storageID: getScriptProp_('storageID'),
  specialResourceID: getScriptProp_('SpecialResourceID'),
  logId: getScriptProp_('LogSSid'),
  myDB: objDB.open(getScriptProp_('DatabaseSSid')),
  site: getScriptProp_('Site'),
  errSheet: SpreadsheetApp.openById(getScriptProp_('LogSSid')).getSheetByName('errors'),
  logSheet: SpreadsheetApp.openById(getScriptProp_('LogSSid')).getSheetByName('log'), //LogSSid
  assistSh: 'Assistants',
  employSh: 'Employees',
  clientsSh: 'Clients',
  filesSh: 'Files',
  tariffsSh: 'Tariffs',
  groupsSh: 'Groups',
  groupLeadSh: 'GroupLeaders',
  groupActSh: 'GroupActors',
  groupClsSh: 'GroupClients',
  eventSh: 'Events',
  trigSh: 'Triggers',
  logSize: getScriptProp_('logSize'),
  superAdminEmail: DriveApp.getFolderById(getScriptProp_('DatabaseSSid')).getOwner().getEmail(),
  cacheTime: parseInt(getScriptProp_('CacheTime'), 10), // should be 3 (180000 ms) min for user permission caching
  waitForLockTime: 10000, // 10 s
  sleepConstantForLockBug: 5000, // 5 s
  sleepConstantForUnlockBug: 3000, // 3 s
  admin: {
    "permission": 0,
    "name": "Admin"
  },
  leader: {
    "permission": 1,
    "name": "Vedoucí Skupiny"
  },
  administrative: {
    "permission": 2,
    "name": "Administrativní Pracovník"
  },
  assistant: {
    "permission": 3,
    "name": "Osobní Asistent"
  }
}

/* Enums for Access in different parts of system*/
var AccessEnums = {
  ADMIN: 0,
  LEADER: 1,
  ADMINISTRATIVE: 2,
  ASSISTANT: 3,

  CLIENT_OR_EVENT: 500,
  TARIFF: 501,
  EMPLOYEE: 502,
  EMPLOYEES_GROUPS: 503,
  GROUP: 504,
  SCHEDULE: 505, // neměnit číslo - používají javascript soubory
  CLIENT: 506,
  EVENT: 507
}

var PermissionTypes = {
  VIEW: 0,
  EDIT: 1
}

/**
 * Gets User permissions neatly sorted and with Czech Transaltions
 *
 * @return list of user roles and their names
 */
function getUserRolesInCzech() {
  return [manager.admin, manager.leader, manager.administrative, manager.assistant];
}