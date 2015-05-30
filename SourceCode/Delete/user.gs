/**
 * Checks if webApp got right parameters and deletes User
 *
 * @return object which designates success or failure
 */
function deleteUser() {   
  var email =  getProp('email');
  var name =  getProp('name'); 
  var msg = {}; 
  
  Utils.validate(msg,email,{actions:['notNull','isNotDatabaseOwner'],actionObjs:[{},{}] ,
     actionErrors:[{err:'System Error : no parameter'},{err:'Nelze smazat vlastníka databáze'}]     
    });
   
  var perm = Utils.getUserPermission(email);   
   
  Utils.validate(msg,perm,{actions:['canEdit'],actionObjs:[{}],
     actionErrors:[{err:'Uživatel není v systému nebo nemáte právo ho smazat'}]     
    });
    
  if(Utils.isObjErrorFree(msg)){       
    if(Utils.deleteEmployee({email: email})){
        msg.message ='Uživatel ' + name + ' byl úspěšně smazán.';
    }else{
        msg.err = 'Uživatel byl již smazán';
    }         
  }
      
  return msg;
}