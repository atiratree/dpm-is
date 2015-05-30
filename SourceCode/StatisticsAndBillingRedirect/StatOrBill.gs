/**
 * Parses and validates data from formObject, then it creates Billing or Statistics.
 *
 * @param formObject Object received from client's browser form.
 * @param isBill if true processes billing form, statistics otherwise
 * @return object which designates success or failure (in a case form had nonvalid data)
 */
function processStatOrBillObj(formObject,isBill) {
  var errorMsg = isBill ? {fromErr:'',toErr:'',selectErr:''} : {fromErr:'',toErr:''};  
  var from,to,client;  
  
  from = Utils.validate(errorMsg,formObject.fromBox,{
    actions:['validateDate',],
    actionObjs:[{}],
    actionErrors:[{fromErr:'*není validní datum (formát RRRR-MM-DD)'}]     
  }); 
  
  to = Utils.validate(errorMsg,formObject.toBox,{
    actions:['validateDate',],
    actionObjs:[{}],
    actionErrors:[{toErr:'*není validní datum (formát RRRR-MM-DD)'}]     
  }); 
    
  Utils.validate(errorMsg,Utils.getUserPermission(),{
     actions:['notUnique'],
     actionObjs:[{uniqueArray:['0','1','2']}],
     actionErrors:[{fromErr:'*nemáte oprávnění pro tento typ akce'}]     
    });
  
  if(!errorMsg.fromErr && !errorMsg.toErr && from.getTime() > to.getTime()){
    errorMsg.fromErr = '*datum od je větší než datum do';
  }
  
  if(isBill){
    client = Utils.validate(errorMsg,formObject.selectBox,{
      actions:['notNull','notUnique'],
      actionObjs:[{},{uniqueArray:getClients()}],
      actionErrors:[{selectErr:'*vyberte klienta'},{selectErr:'*zadejte validního klienta'}]     
    });
  }
  
  if(Utils.isObjErrorFree(errorMsg)) {    
    if(isBill){
      errorMsg.success = createBilling(from,to,client);      
    }else{
      errorMsg.success = createStatistics(from,to);
    }
    Utils.log('Generated ' + (isBill ? 'billing for '  + client: 'stats ') + ' in time span ' + from + ' - ' + to );
    
  } 
  
  return errorMsg; 
}
