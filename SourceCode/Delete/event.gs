/**
 * Checks if webApp got right parameters and deletes Client or Event
 *
 * @param {Object} opts received URL params
 * @return {Object} object which designates success or failure
 */
function deleteEvent(opts) {
  var name = opts.name;
  var msg = {};

  Utils.validate(msg,name,{actions:['notNull'],actionObjs:[{}],
     actionErrors:[{err:'System Error : no parameter'}]
    });

  Utils.validate(msg,Utils.AccessEnums.EVENT,{actions:['canEdit'],actionObjs:[{}],
     actionErrors:[{err:getResource('accessError', opts)}]
    });

  if(Utils.isObjErrorFree(msg)) {
    if(Utils.deleteEvent({name: name})){
      msg.message = getResource('successMessage', opts);
    }else{
      msg.err = getResource('failDelete', opts);
    }
  }

  return msg;
}
