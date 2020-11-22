/**
 * Parses and validates data from formObject, then it creates Tariff.
 *
 * @param formObject Object received from client's browser form.
 * @return {Object} object which designates success or failure (in a case form had nonvalid data)
 * @throws Exception if creating Tariff failed
 */
function processTariffObj(formObject) {
  var errorMsg = {nameErr:'',shortcutErr:'',priceErr:'',defaultErr:''};
  var tariffs = Utils.findTariffs();
  var tariff = {};

  tariff.name = Utils.validate(errorMsg,formObject.nameBox,{
     actions:['trim','unique','notNull'],
     actionObjs:[{},{uniqueArray:tariffs,uniqueProp:'name'},{}],
     actionErrors:[{},{nameErr:'*tento název je již registrován'},{nameErr:'*vyplňte pásmo'}]
  });

  tariff.shortcut = Utils.validate(errorMsg,formObject.shortcutBox,{
     actions:['trim','unique','notNull'],
     actionObjs:[{},{uniqueArray:tariffs,uniqueProp:'shortcut'},{}],
     actionErrors:[{},{shortcutErr:'*tato zkratka je již registrována'},{shortcutErr:'*vyplňte zkratku'}]
  });

  tariff.price = Utils.validate(errorMsg,formObject.priceBox,{
     actions:['notNull','isNonNegativeNumber'],
     actionObjs:[{},{}],
     actionErrors:[{priceErr:'*vyplňte cenu'},{priceErr:'*vyplňte nezáporné číslo'}]
  });

  tariff['default'] = tariff.shortcut === 'Z' ? 1 : 0;

  Utils.validate(errorMsg,Utils.AccessEnums.TARIFF,{
     actions:['canEdit'],
     actionObjs:[{}],
     actionErrors:[{nameErr:'*nemáte oprávnění pro tento typ akce'}]
  });

  if (Utils.isObjErrorFree(errorMsg)) {
    if (Utils.createTariff(tariff)) {
      errorMsg.success = 'Cenové pásmo uspěšně přidáno.';
    } else {
      throw {message: 'createTariff'};
    }
  }

  return errorMsg;
}