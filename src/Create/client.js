/**
 * Parses and validates data from formObject, then it creates Client
 *
 * @param formObject Object received from client's browser form.
 * @return {Object} object which designates success or failure (in a case form had nonvalid data)
 * @throws Exception if creating Event failed
 */
function processClientObj(formObject) {
  var errorMsg = {nameErr:'',emailErr:''};
  var client = {};

  client.name = Utils.validate(errorMsg,formObject.nameBox,{
     actions:['trim','unique','notNull'],
     actionObjs:[{},{uniqueArray:getClientAndEventNames()},{}],
     actionErrors:[{},{nameErr:'*tento název je již registrován'},{nameErr:'*vyplňte název'}]
  });

  client.email = formObject.emailBox == '' ? '' : Utils.validate(errorMsg,formObject.emailBox,{
     actions:['trim','isEmail'],
     actionObjs:[{},{}],
     actionErrors:[{},{emailErr:'*nevalidní email'}]
  });

  client.isInGroups = Utils.validateGroups(formObject,errorMsg,'isInGroup');

  Utils.validate(errorMsg,Utils.AccessEnums.CLIENT,{
     actions:['canEdit'],
     actionObjs:[{}],
     actionErrors:[{nameErr:'*nemáte oprávnění pro tento typ akce'}]
  });

  if(Utils.isObjErrorFree(errorMsg)) {
    if(Utils.createClient(client)){
       errorMsg.success = 'Klient uspěšně přidán.';
    }else{
      throw {message:'createEvent'};
    }
  }

  return errorMsg;
}
