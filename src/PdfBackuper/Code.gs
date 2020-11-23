/**
 * Serves HTML and checks user's permission to view it
 *
 * @param e url parameters setting this webapp's beahviour
 * @return {Object} HTML page with javascript
 */
function doGet(e) {
  var html;

  try {
    if (!e.parameter.instance) {
      html = createPresentableHTML('<p>Authorizace...OK</p>', 'string');
    } else if (Utils.getUserPermission() == 0 || Utils.getUserPermission() == 1 || Utils.getUserPermission() == 2) {
      html = createPresentableHTML('main', 'file', 'Zálohování do PDF');
    } else {
      html = createPresentableHTML('<p>Nemáte patřičné oprávnění pro zobrazení této stránky.</p>', 'string');
    }
  } catch (error) {
    html = createPresentableHTML('<p>SERVER_ERROR</p>', 'string');
    Utils.logError('[BackupToPdf] ' + error);
  }
  return html;
}

/**
 * Processes form and returns result.
 *
 * @param formObject Form object
 * @return {Object} object which designates success or failure
 */
function processForm(formObject) {
  try {
    var errorMsg = {fromErr:'',toErr:''};
    var from,to;

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

    if (Utils.isObjErrorFree(errorMsg)) {
      errorMsg.success = backupToPdf(from,to);
      Utils.log('Backuped to pdf in time span ' + from + ' - ' + to );
    }

    return errorMsg;
  } catch (error) {
    if (error.timeout){
      return {fail: 'fail', failMessage: 'Čas na spuštění skriptu vypršel. Skuste zálohovat znovu pro kratší časový interval.'}
    }

    Utils.logError(error);
    return {
      fail: 'fail'
    }
  }
}
