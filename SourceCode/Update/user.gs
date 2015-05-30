/**
 * Parses and validates data from formObject, then it updates User. 
 *
 * @param formObject Object received from client's browser form.
 * @return object which designates success or failure (in a case form had nonvalid data)
 * @throws Exception if updating User failed
 */
function processUserObj(formObject) {
  var errorMsg = {nameErr:'',emailErr:'',nickErr:'',colorErr:'',selectErr:'',groupErr:''};  
  var oldUser = getData('updateObj');
  var user = {email:oldUser.email,nick:oldUser.nick,leadsGroups:[],isInGroups:[]};
  var fullUpdate = Utils.hasAccessTo(Utils.getUserPermission(user.email), Utils.PermissionTypes.EDIT);
  user.permissionChanged = Utils.hasAccessTo(Utils.AccessEnums.EMPLOYEE, Utils.PermissionTypes.EDIT) && formObject.selectBox !=  oldUser.permission;
     
  if(!fullUpdate || formObject.nameBox ===  user.name ){
    user.name = oldUser.name;
  }else{
    user.name = Utils.validate(errorMsg,formObject.nameBox,{
       actions:['trim','notNull'],
       actionObjs:[{},{}],
       actionErrors:[{},{nameErr:'*vyplňte jméno'}]     
    });
  }  
  
  if(user.permissionChanged){
    user.permission = Utils.validate(errorMsg,formObject.selectBox,{
       actions:['notNull','canEdit'],
       actionObjs:[{},{}],
       actionErrors:[{selectErr:'*vyberte typ uživatele'},{selectErr:'*nemáte oprávnění pro tento typ akce'}]     
    });
  }else{  
    user.permission = oldUser.permission;
  }  
  
  if(!fullUpdate || formObject.colorPicker ===  user.color ){
    user.color = oldUser.color;
  }else{ 
    user.color = Utils.validate(errorMsg,formObject.colorPicker,{
       actions:['isColor'],actionObjs:[{}],actionErrors:[{colorErr:'*zadejte barvu (hex)'}]     
      });  
  }
 
  switch(parseInt(formObject.selectBox,10)){
    case Utils.AccessEnums.ADMIN: 
    case Utils.AccessEnums.LEADER: 
      user.leadsGroups = Utils.validateGroups(formObject,errorMsg,'groupLeader',oldUser);   
    case Utils.AccessEnums.ASSISTANT: 
      user.isInGroups =  Utils.validateGroups(formObject,errorMsg,'isInGroup',oldUser);  
      break;
  }
  
  if(Utils.isObjErrorFree(errorMsg)) {
    if(resolveUpdatability(oldUser,user)){      
      if(Utils.updateEmployee(user)){ 
         errorMsg.success = 'Uživatel uspěšně změněn.';
         if(user.permissionChanged){
            errorMsg.permission = user.permission;// permission message
         }
        
      }else{
        throw {message:'updateEmployee'};
      }  
    }else{
      errorMsg.success = 'Uživatel nebyl změněn';
    }
  }
  
  return errorMsg;
}

/**
 * Returns roles in system I can edit or the role of user being edited.
 *
 * @return array of roles in format {permission:x,name:x};
 */
function getMyAccessRightsNames() {
  var updateObj = getData('updateObj');
  var accessRightsNames = [];

  if (Utils.getUserPermission() == Utils.AccessEnums.ADMIN) {
    var array = Utils.getMyAccessRightsNames();

    array.forEach(function(item) {
      if (item.permission == updateObj.permission) {
        accessRightsNames.unshift(item);
      } else {
        accessRightsNames.push(item);
      }
    });
  } else if (Utils.getUserPermission() == Utils.AccessEnums.LEADER) {
    accessRightsNames = Utils.getUserRolesInCzech().filter(function(item) {
      return item.permission == updateObj.permission
    });
  }
  return accessRightsNames;
}


/**
 * Resolves if any changes to the user were made and sets updatibility for user.
 *
 * @param oldUser oldUser for comparission
 * @param user oldUser wih changes
 * @return true if changes were made to user, false otherwise
 */
function resolveUpdatability(oldUser, user) {
  var isUpdatable = !shallowEquals_(oldUser, user);
  user['isUpdatable'] = isUpdatable;
  isUpdatable = isUpdatable || user.leadsGroups && user.leadsGroups.length > 0;
  isUpdatable = isUpdatable || user.isInGroups && user.isInGroups.length > 0;
  return isUpdatable;
}

function shallowEquals_(obj1, obj2) {
  for (var p in obj1) {
    if (obj1.hasOwnProperty(p) && !(obj1[p] instanceof Object) && obj1[p] != obj2[p]) {
      return false;
    }
  }
  return true;
}

/**
 * Wrapper function.
 */
function findAllGroups() {
  return Utils.getMyGroupsWithEditAtrs(getData('updateObj'), getProp('instance'));
}
