/**
 * Parses and validates data from formObject, then it creates Group.
 *
 * @param formObject Object received from client's browser form.
 * @return {Object} object which designates success or failure (in a case form had nonvalid data)
 * @throws Exception if creating Group failed
 */
function processGroupObj(formObject) {
  var errorMsg = {groupErr:'', weekdayRowsErr: '', weekendRowsErr: ''};
  var groups = Utils.findGroupsAsArray();
  var group = {};

  group.group = Utils.validate(errorMsg, formObject.groupBox, {
     actions:['trim','notNull','unique','length'],
     actionObjs:[{},{},{uniqueArray:groups},{length:10}],
     actionErrors:[{},{groupErr:'*vyplňte skupinu'},{groupErr:'*jméno této skupny není unikátní'},{groupErr:'*tato skupina má více než 10 znaků'}]
  });

  group.weekdayRows = Utils.validate(errorMsg, formObject.weekdayRowsBox, {
    actions:['notNull','isPositiveNumber'],
    actionObjs:[{},{}],
    actionErrors:[{weekdayRowsErr:'*vyplňte počet řádků'},{weekdayRowsErr:'*vyplňte pozitivní číslo'}]
  });

  group.weekendRows = Utils.validate(errorMsg, formObject.weekendRowsBox, {
    actions:['notNull','isPositiveNumber'],
    actionObjs:[{},{}],
    actionErrors:[{weekendRowsErr:'*vyplňte počet řádků'},{weekendRowsErr:'*vyplňte pozitivní číslo'}]
  });

  Utils.validate(errorMsg,Utils.AccessEnums.GROUP,{
     actions:['canEdit'],
     actionObjs:[{}],
     actionErrors:[{groupErr:'*nemáte oprávnění pro tento typ akce'}]
  });

  if(Utils.isObjErrorFree(errorMsg)) {
    if(Utils.createGroup(group)){
        errorMsg.success = 'Skupina uspěšně přidána.';
        errorMsg.permission = Utils.AccessEnums.SCHEDULE;
    }else{
      throw {message:'createGroup'};
    }
  }

  return errorMsg;
}