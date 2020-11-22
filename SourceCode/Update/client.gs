/**
 * Parses and validates data from formObject, then it updates Client.
 *
 * @param formObject Object received from client's browser form.
 * @param {Object} opts received URL params and loaded data
 * @return {Object} object which designates success or failure (in a case form had nonvalid data)
 * @throws Exception if updating Client failed
 */
function processClientObj(formObject, opts) {
  var errorMsg = {emailErr:''};
  var oldClient = opts.updateObj;
  var client = {name:oldClient.name, isInGroups:[]};

  var email = formObject.emailBox
  client.email = (email == '' || email === client.email ) ? email : Utils.validate(errorMsg,email,{
     actions:['trim','isEmail'],
     actionObjs:[{},{}],
     actionErrors:[{},{emailErr:'*nevalidní email'}]
  });

  client.isInGroups = Utils.validateGroups(formObject,errorMsg,'isInGroup',oldClient);

  Utils.validate(errorMsg,Utils.AccessEnums.CLIENT,{
     actions:['canEdit'],
     actionObjs:[{}],
     actionErrors:[{emailErr:'*nemáte oprávnění pro tento typ akce'}]
  });

  if(Utils.isObjErrorFree(errorMsg)) {
    if(resolveUpdatability(oldClient,client)){
      if(Utils.updateClient(client)){
         errorMsg.success = 'Klient uspěšně změněn.';
      }else{
        throw {message:'updateKlient'};
      }
    }else{
      errorMsg.success = 'Klient nebyl změněn';
    }
  }

  return errorMsg;
}
