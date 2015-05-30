/**
 * Checks if webApp got right parameters and deletes Client or Event
 *
 * @return object which designates success or failure
 */
function deleteEvent() {   
  var name = getProp('name');
  var msg = {}; 
   
  Utils.validate(msg,name,{actions:['notNull'],actionObjs:[{}],
     actionErrors:[{err:'System Error : no parameter'}]     
    });
    
  Utils.validate(msg,Utils.AccessEnums.EVENT,{actions:['canEdit'],actionObjs:[{}],
     actionErrors:[{err:getResource('accessError')}]     
    });  
    
  if(Utils.isObjErrorFree(msg)) {
    if(Utils.deleteEvent({name: name})){
      msg.message = getResource('successMessage');
    }else{
      msg.err = getResource('failDelete');
    }  
  } 
  
  return msg;
}