/**
 * Checks if webApp got right parameters and deletes Client or Event
 *
 * @return object which designates success or failure
 */
function deleteClient() {   
  var name = getProp('name');
  var msg = {}; 
   
  Utils.validate(msg,name,{actions:['notNull'],actionObjs:[{}],
     actionErrors:[{err:'System Error : no parameter'}]     
    });
    
  Utils.validate(msg,Utils.AccessEnums.CLIENT,{actions:['canEdit'],actionObjs:[{}],
     actionErrors:[{err:getResource('accessError')}]     
    });  
    
  if(Utils.isObjErrorFree(msg)) {
    if(Utils.deleteClient({name: name})){
      msg.message = getResource('successMessage');
    }else{
      msg.err = getResource('failDelete');
    }  
  } 
  
  return msg;
}