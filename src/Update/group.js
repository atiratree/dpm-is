/**
 * Parses and validates data from formObject, then it updates Group.
 *
 * @param formObject Object received from client's browser form.
 * @param {Object} opts received URL params and loaded data
 * @return {Object} object which designates success or failure (in a case form had nonvalid data)
 * @throws Exception if updating Group failed
 */
function processGroupObj(formObject, opts) {
  var errorMsg = { groupErr:'', weekdayRowsErr: '', weekendRowsErr: '' };
  var oldGroup = opts.updateObj;
  var group = { group: oldGroup.group };


  if (formObject.weekdayRowsBox ==  oldGroup.weekdayRows) {
    group.weekdayRows = oldGroup.weekdayRows;
  } else {
    group.weekdayRows = Utils.validate(errorMsg, formObject.weekdayRowsBox, {
      actions:['notNull','isPositiveNumber'],
      actionObjs:[{},{}],
      actionErrors:[{weekdayRowsErr:'*vyplňte počet řádků'},{weekdayRowsErr:'*vyplňte pozitivní číslo'}]
    });
  }

  if (formObject.weekendRowsBox ==  oldGroup.weekendRows) {
    group.weekendRows = oldGroup.weekendRows;
  } else {
    group.weekendRows = Utils.validate(errorMsg, formObject.weekendRowsBox, {
      actions:['notNull','isPositiveNumber'],
      actionObjs:[{},{}],
      actionErrors:[{weekendRowsErr:'*vyplňte počet řádků'},{weekendRowsErr:'*vyplňte pozitivní číslo'}]
    });
  }

  Utils.validate(errorMsg,Utils.AccessEnums.GROUP,{
    actions:['canEdit'],
    actionObjs:[{}],
    actionErrors:[{groupErr:'*nemáte oprávnění pro tento typ akce'}]
  });

   if (Utils.isObjErrorFree(errorMsg)) {
     if (!shallowEquals_(group, oldGroup)) {
       if (Utils.updateGroup(group, oldGroup.group)) {
          errorMsg.success = 'Skupina uspěšně změněna.';
          errorMsg.permission = Utils.AccessEnums.SCHEDULE;
       } else {
         throw {message:'updateGroup'};
       }
     } else {
       errorMsg.success = 'Skupina nebyla změněna.';
     }
  }

  return errorMsg;
}
