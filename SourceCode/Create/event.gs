/**
 * Parses and validates data from formObject, then it creates Event 
 *
 * @param formObject Object received from client's browser form. 
 * @return object which designates success or failure (in a case form had nonvalid data)
 * @throws Exception if creating Event failed
 */
function processEventObj(formObject) {  
  var errorMsg = {nameErr:''};
  var client = {}; 
  
  client.name = Utils.validate(errorMsg,formObject.nameBox,{
     actions:['trim','unique','notNull'],
     actionObjs:[{},{uniqueArray:getClientAndEventNames()},{}],
     actionErrors:[{},{nameErr:'*tento název je již registrován'},{nameErr:'*vyplňte název'}]     
  });
    
  Utils.validate(errorMsg,Utils.AccessEnums.EVENT,{
     actions:['canEdit'],
     actionObjs:[{}],
     actionErrors:[{nameErr:'*nemáte oprávnění pro tento typ akce'}]     
  });
 
  if (Utils.isObjErrorFree(errorMsg)) {
    if (Utils.createEvent(client)) {
      errorMsg.success = 'Událost uspěšně přidána.';
    } else {
      throw {message: 'createEvent'};
    }
  }

  return errorMsg;
}

/**
 * @return returns names of all events and clients
 */
function getClientAndEventNames() {
  var clientsNames = Utils.findClients(['name']);
  var eventNames = Utils.findEvents(['name']);

  clientsNames.push.apply(clientsNames, eventNames);

  return Utils.convertObjectsToArrayByProperty(clientsNames, 'name');
}

