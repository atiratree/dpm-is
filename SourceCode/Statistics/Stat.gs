/**
 * Parses and validates data from formObject, then it creates Statistics.
 *
 * @param formObject Object received from client's browser form.
 * @return {Object} object which designates success or failure (in a case form had nonvalid data)
 */
function process(formObject) {
  var errorMsg = {fromErr:'',toErr:''};
  var from,to;

  from = Utils.validate(errorMsg,formObject.fromBox,{
    actions:['validateDate',],
    actionObjs:[{}],
    actionErrors:[{fromErr:'*není validní datum (formát RRRR-MM-DD)'}]
  });

  to = Utils.validate(errorMsg,formObject.toBox,{
    actions:['validateDate',],
    actionObjs:[{}],
    actionErrors:[{toErr:'*není validní datum (formát RRRR-MM-DD)'}]
  });

  Utils.validate(errorMsg,Utils.getUserPermission(),{
     actions:['notUnique'],
     actionObjs:[{uniqueArray:['0','1','2']}],
     actionErrors:[{fromErr:'*nemáte oprávnění pro tento typ akce'}]
    });

  if(!errorMsg.fromErr && !errorMsg.toErr && from.getTime() > to.getTime()){
    errorMsg.fromErr = '*datum od je větší než datum do';
  }

  if(Utils.isObjErrorFree(errorMsg)) {
    errorMsg.success = createStatistics(from,to);
    Utils.log('Generated stats in time span ' + from + ' - ' + to );
  }

  return errorMsg;
}
