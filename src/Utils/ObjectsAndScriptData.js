function getUtilsProperties() {
  return {
    TimetablesID: '0B9CMdZXOlRtCNUkxSFZQTS1BWjQ',
    ThisPropertiesVersion: '3',
    DatabaseSSid: '1dBq8U83mrkX-iQLi0oKpoSgDkYxvvYABMrefL5IOfYg',
    correctionsLogSize: '10000',
    errorsLogSize: '20000',
    logSize: '200000',
    LogSSid: '1LvOpxVTLmFBazb4QDOi-0udo4vHGm4JSJTw5yn4OKDw',
    SpecialResourceID: '1nfy2IZEneHXPesygyh7uReoMc_q-TrKdxBNMtn6Dbgc',
    storageID: '0B9CMdZXOlRtCfkdpNU1IdUxhZkgyaVRZang2T1ZtbHFTRGdCZXJQTmJNcVZFakM5NEF4OFU',
  };
}

function getUtilsProp_(key) {
  return getUtilsProperties()[key];
}

/**
 * Tries to open spreadsheet
 * waits a while if Google service unavailible
 *
 * @param id id of spreadsheet
 * @return opened spreadsheet
 */
function openSpreadsheet(id){
  try{
    return SpreadsheetApp.openById(id);
  }catch(x){ //Bug  Document 1xx is missing (perhaps it was deleted?)
    Utilities.sleep(3000);
    return SpreadsheetApp.openById(id);
  }
}

/* Manager for storing important data scripts might need*/
var manager = {
  dbID: getUtilsProp_('DatabaseSSid'), // used in TableScript
  timetablesID: getUtilsProp_('TimetablesID'),
  storageID: getUtilsProp_('storageID'),
  specialResourceID: getUtilsProp_('SpecialResourceID'),
  logId: getUtilsProp_('LogSSid'),
  myDB: ObjDB.open(getUtilsProp_('DatabaseSSid')),
  errSheet: openSpreadsheet(getUtilsProp_('LogSSid')).getSheetByName('errors'),
  logSheet: openSpreadsheet(getUtilsProp_('LogSSid')).getSheetByName('log'), //LogSSid
  correctionSheet: openSpreadsheet(getUtilsProp_('LogSSid')).getSheetByName('corrections'),
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
  keyStoreSh: 'KeyStore',
  logSize: getUtilsProp_('logSize'),
  errorsLogSize: getUtilsProp_('errorsLogSize'),
  correctionsLogSize: getUtilsProp_('correctionsLogSize'),
  superAdminEmail: DriveApp.getFolderById(getUtilsProp_('DatabaseSSid')).getOwner().getEmail(),
  waitForLockTime: 10000, // 10 s
  sleepConstantForLockBug: 5000, // 5 s
  sleepConstantForUnlockBug: 3000, // 3 s
  sleepConstantForSSServiceBug: 5000, // 5 s // 30.5.2016 changed from 3s -> 5s
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
  SCHEDULE: 505, // do not change - used by javascript files
  CLIENT: 506,
  EVENT: 507,
  EMAIL_SENDER: 508
}

var PermissionTypes = {
  VIEW: 0,
  EDIT: 1
}

/**
 * Gets User permissions neatly sorted and with Czech Transaltions
 *
 * @return {Array<Object>} list of user roles and their names
 */
function getUserRolesInCzech() {
  return [manager.admin, manager.leader, manager.administrative, manager.assistant];
}
