/**
 * Parses and validates data from formObject, then it updates Tariff. 
 *
 * @param formObject Object received from client's browser form.
 * @return object which designates success or failure (in a case form had nonvalid data)
 * @throws Exception if updating Tariff failed
 */
function processTariffObj(formObject) {  
  var errorMsg = {nameErr:'',priceErr:'',defaultErr:''};
  var tariffs = Utils.findTariffs(); 
  var oldTariff = getData('updateObj');  
  var tariff = {shortcut:oldTariff.shortcut}; 
 
  tariff['default'] = oldTariff['default'];
  
  if(formObject.nameBox ===  oldTariff.name ){
    tariff.name = oldTariff.name;
  }else{
    tariff.name = Utils.validate(errorMsg,formObject.nameBox,{
      actions:['trim','unique','notNull'],
      actionObjs:[{},{uniqueArray:tariffs,uniqueProp:'name'},{}],
      actionErrors:[{},{nameErr:'*tento název je již registrován'},{nameErr:'*vyplňte pásmo'}]     
    });
  }
  
  if(formObject.priceBox ==  oldTariff.price ){
    tariff.price = oldTariff.price;
  }else{
    tariff.price = Utils.validate(errorMsg,formObject.priceBox,{
      actions:['notNull','isNonNegativeNumber'],
      actionObjs:[{},{}],
      actionErrors:[{priceErr:'*vyplňte cenu'},{priceErr:'*vyplňte nezáporné číslo'}]     
    }); 
  }
 
  Utils.validate(errorMsg,Utils.AccessEnums.TARIFF,{
     actions:['canEdit'],
     actionObjs:[{}],
     actionErrors:[{nameErr:'*nemáte oprávnění pro tento typ akce'}]     
  });
   
   if(Utils.isObjErrorFree(errorMsg)) {
     if(!shallowEquals_(oldTariff,tariff)){
       if(Utils.updateTariff(tariff)){
          errorMsg.success = 'Cenové pásmo uspěšně změněno.';
       }else{
         throw {message:'updateTariff'};
       }
     }else{
       errorMsg.success = 'Cenové pásmo nebylo změněno';
     }
  }    
  
  return errorMsg; 
}
