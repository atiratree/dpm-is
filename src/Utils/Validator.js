/**
 * Runs actions on input in received order and sets errors accordingly
 *
 * Valid actions are strings:
 * trim : trims(' counts as space) object and sets input as trimmed input
 * notNull : checks if input is not null or empty string
 * unique : checks if input is unique between array passed in processObj.actionObjs.uniqueArray
 * length : checks if input has length maximally long as defined in passed processObj.actionObjs.length
 * canEdit : checks if active user can edited resource specified in input
 * isColor : checks if input is valid hex colour string
 * isNonNegativeNumber : checks if input isnNon negative number
 * isNotDatabaseOwner : check if input is not email of database owner
 * validateDate : checks if input is valid date
 * isDomainEmail' : checks if input is email and belongs to domovpromne.cz domain
 *
 * if action is invalid it sets error defined in processObj.actionErrors.someError to errorResult
 * if action doesn't need needs special object in actionObjs, there should be empty object or null
 *
 * @param errorResult reference to Object in which properties will be set defined errors if inout found nonvalid
 * @param input input to be processed
 * @param processObj  processObj is object of 3 arrays defined as
 *    {actions:['action'], actionObjs:[{}], actionErrors:[{error:'didn't validate'}]}
 *    Each action, coresponding actionObj and actionError should be on same index in array
 * @return {Object} validated and processed input
 */
function validate(errorResult, input, processObj) {
  var actions = processObj.actions;
  var actionErrors = processObj.actionErrors;
  var actionObjs = processObj.actionObjs;

  for (var i = 0; i < actions.length; i++) {
    switch (actions[i]) {
      case 'trim':
        input = trim(input);
        break;
      case 'notNull':
        if (input == null || input == '') {
          setError_(errorResult, actionErrors[i]);
        }
        break;
      case 'unique':
        var array = actionObjs[i].uniqueArray;
        var prop = actionObjs[i].uniqueProp;

        for (var j = 0; j < array.length; j++) {
          var value = prop ? array[j][prop] : array[j]
          if (input == value) {
            setError_(errorResult, actionErrors[i]);
            break;
          }
        }
        break;
      case 'length':
        if (input.length > actionObjs[i].length) {
          setError_(errorResult, actionErrors[i]);
        }
        break;
      case 'canEdit':
        if (!hasAccessTo(parseInt(input, 10), PermissionTypes.EDIT)) {
          setError_(errorResult, actionErrors[i]);
        }
        break;
      case 'isColor':
        if (!(/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(input))) {
          setError_(errorResult, actionErrors[i]);
        }
        break;
      case 'isEmail':
        if (!(/[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i.test(
            input))) {
          setError_(errorResult, actionErrors[i]);
        }
        break;
      case 'isNonNegativeNumber':
        if (isNaN(input) || input < 0) {
          setError_(errorResult, actionErrors[i]);
        }
        break;
      case 'isNotDatabaseOwner':
        if (isMainAdmin(input)) {
          setError_(errorResult, actionErrors[i]);
        }
        break;
      case 'validateDate':
        if (!isValidDate_(input)) {
          setError_(errorResult, actionErrors[i]);
        } else {
          input = new Date(input.replace(/-/g, '/'));
        }
        break;
      case 'isDomainEmail':
        var resource = DriveApp.getFolderById(manager.specialResourceID);
        try {
          resource.addViewer(input);
          resource.removeViewer(input);
        } catch (x) {
          setError_(errorResult, actionErrors[i]);
        }
    }
  }

  return input;
}

/**
 * Checks if we have permision to change users groups which are defined in formObject.
 * sets error messages to errorMsg object if we try to edit groups which we are not authorized to
 *
 * @param formObject object representing form in javascript i.e. new user
 * @param errorMsg object to be set if groups are set invalidly
 * @param type object  which can be either 'groupLeader' or 'isInGroup' and switches validation
 * @param oldUser object representing users groups before editation
 * @return {Array<Object>} array of validated groups
 */
function validateGroups(formObject, errorMsg, type, oldUser) {
  var editableGroups = convertObjectsToArrayByProperty(getMyGroupsWithEditAtrs().filter(function(item) {
    return item.editable == true
  }), 'group');
  var oldGroups = oldUser ? (oldUser[type === 'groupLeader' ? 'leadsGroups' : 'isInGroups']) : [];
  var objects = formObject[''] ? (Array.isArray(formObject['']) ? formObject[''] : [formObject['']]) : [];
  var resArray = [];

  var inputGroups = objects.filter(function(item) { // selected ones
    return new RegExp('^' + type + '').test(item);
  }).map(function(item) {
    return item.replace(type, '');
  });

  resArray.push.apply(resArray,
    inputGroups.filter(function(item) {
      return oldGroups.indexOf(item) < 0;
    }).map(function(item) {
      return {
        group: item,
        isInDb: false,
        isUpdatable: true
      }
    })
  );

  resArray.push.apply(resArray,
    oldGroups.filter(function(item) {
      return inputGroups.indexOf(item) < 0;
    }).map(function(item) {
      return {
        group: item,
        isInDb: true,
        isUpdatable: true
      }
    })
  );

  resArray.forEach(function(item) {
    if (editableGroups.indexOf(item.group) < 0) {
      var groupErr = {};
      groupErr[type + 'Err'] = '*' + item.group + ' neexistuje';
      setError_(errorMsg, groupErr);
    }
  });

  return resArray;
}

/**
 *  Sets properties of error object to result
 *
 * @param result object to be set
 * @param error object to be coppied
 */
function setError_(result, error) {
  for (var k in error) {
    result[k] = error[k];
  }
}

/**
 * checks if text is valid date
 *
 * @param text string to check
 * @return {boolean} true if is valid date, false otherwise
 */
function isValidDate_(text) {
  if (!(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(text))) {
    return false;
  }

  text = text.replace(/-/g, '/')

  var date = Date.parse(text);

  if (isNaN(date)) {
    return false;
  }

  var comp = text.split('/');

  if (comp.length !== 3) {
    return false;
  }

  var y = parseInt(comp[0], 10);
  var m = parseInt(comp[1], 10);
  var d = parseInt(comp[2], 10);

  var date = new Date(y, m - 1, d);
  return (date.getFullYear() == y && date.getMonth() + 1 == m && date.getDate() == d);
}
