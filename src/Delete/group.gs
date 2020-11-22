/**
 * Checks if webApp got right parameters and deletes Group
 *
 * @param opts received URL params
 * @return object which designates success or failure
 */
function deleteGroup(opts) {
  var group =  opts.name;
  var msg = {};

  Utils.validate(msg,group,{actions:['notNull'],actionObjs:[{}] ,
     actionErrors:[{err:'System Error : no parameter'}]
    });

  Utils.validate(msg,Utils.AccessEnums.GROUP,{actions:['canEdit'],actionObjs:[{}],
     actionErrors:[{err:'Skupina není v systému nebo nemáte právo jí smazat'}]
    });

  if(Utils.isObjErrorFree(msg)){
    if(Utils.deleteGroup({group: group})){
        msg.message ='Skupina ' + group + ' byla úspěšně smazána.';
    }else{
        msg.err = 'Skupina byla již smazána.';
    }
  }

  return msg;
}
