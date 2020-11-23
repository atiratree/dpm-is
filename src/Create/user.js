/**
 * Parses and validates data from formObject, then it creates User.
 *
 * @param formObject Object received from client's browser form.
 * @return {Object} object which designates success or failure (in a case form had nonvalid data)
 * @throws Exception if creating User failed
 */
function processUserObj(formObject) {
  var errorMsg = {nameErr: '', emailErr: '', nickErr: '', colorErr: '', selectErr: '', groupErr: ''};
  var employees = Utils.findEmployees(['email','nick']);
  var user = {leadsGroups:[],isInGroups:[]};

  user.name = Utils.validate(errorMsg,formObject.nameBox,{
     actions:['trim','notNull'],
     actionObjs:[{},{}],
     actionErrors:[{},{nameErr:'*vyplňte jméno'}]
  });

  user.email = Utils.validate(errorMsg,formObject.emailBox,{
     actions:['trim','unique','notNull','isDomainEmail'],
     actionObjs:[{},{uniqueArray:employees,uniqueProp:'email'},{},{}],
     actionErrors:[{},{emailErr :'*tento email je již registrován'},{emailErr:'*vyplňte email'},{emailErr:'*tento email není z domény domovpromne'}]
  });

  user.nick = Utils.validate(errorMsg,formObject.nickBox,{
     actions:['trim','unique','notNull','length'],
     actionObjs:[{},{uniqueArray:employees,uniqueProp:'nick'},{},{length:4}],
     actionErrors:[{},{nickErr :'*tato přezdívka je již obsazena'},
         {nickErr:'*vyplňte přezdívku'},{nickErr:'*vyplňte přezdívku dlouhou maximálně 4 znaky'}]
  });

  user.permission = Utils.validate(errorMsg,formObject.selectBox,{
     actions:['notNull','canEdit'],
     actionObjs:[{},{}],
     actionErrors:[{selectErr:'*vyberte typ uživatele'},{selectErr:'*nemáte oprávnění pro tento typ akce'}]
  });

  user.color = Utils.validate(errorMsg,formObject.colorPicker,{
     actions:['isColor'],actionObjs:[{}],actionErrors:[{colorErr:'*zadejte barvu (hex)'}]
  });


  switch (parseInt(formObject.selectBox, 10)) {
    case 0:
    case 1:
      user.leadsGroups = Utils.validateGroups(formObject, errorMsg, 'groupLeader');
    case 3:
      user.isInGroups = Utils.validateGroups(formObject, errorMsg, 'isInGroup');
      break;
  }

  if (Utils.isObjErrorFree(errorMsg)) {
    if (Utils.createEmployee(user)) {
      errorMsg.success = 'Uživatel uspěšně přidán.';
      errorMsg.permission = user.permission; // Site permission message
    } else {
      throw {message: 'create failed'};
    }
  }

  return errorMsg;
}