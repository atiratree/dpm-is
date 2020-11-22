/**
 * prepares sheets for clients and sends emails
 *
 * @param formObject form with emails and message
 * @param {Object} opts received URL params and loaded data
 * @return {string} success string
 */
function processClients(formObject, opts) {
  var emails = formObject[''] ? (Array.isArray(formObject['']) ? formObject[''] : [formObject['']]) : [];
  emails = emails.filter(function(email){
    return email.indexOf("@") > -1;
  });
  if(emails.length == 0){
    return {success: 'Nebyl vybrán žádný email pro odeslání!'};
  }

  var body = formObject['textArea'] == null ? '' : formObject['textArea'];
  var sheetId = opts.sheetId;
  var mainSS = SpreadsheetApp.openById(sheetId);
  var payloadSS = SpreadsheetApp.create(mainSS.getName());
  var payloadAsFile = DriveApp.getFileById(payloadSS.getId());
  var payloadSheet = payloadSS.getActiveSheet();
  var mainSheet = mainSS.getSheetByName('Rozpis');
  var mainSheetData = [];
  var failedEmails = '';
  var sendeddEmails = ''

  // initialize main sheet
  payloadSheet.setName('Rozpis');
  Utils.prepareSheet(payloadSheet, Utils.findFiles(['weekStarts'], {id:sheetId}, 1).pop()['weekStarts'],
    ['Rozpis', 'týden č. ' +  opts.week, opts.year], true);

  // initialize data
  for (var i = 1; i < 8; i++) {
    mainSheetData.push(Utils.extractSpreadSheet(mainSheet, [{
      dayInWeek: i
    }]));
  }

  // initialize clients to manager and remember body of email
  initialize(opts);
  Utils.setProp("email_sender_defaultmessage", body);

  // prepare and send
  emails.forEach(function(email){
    try{
      preparePayloadAndEmail(email, body, mainSheetData, mainSS, payloadSS, mainSheet, payloadSheet, payloadAsFile, opts);
      sendeddEmails += sendeddEmails ? ', ' + email : email;
    }catch(x){
      Utils.logError(x);
      failedEmails += failedEmails ? ', ' + email : email;
    }
  });

  Utils.log('Sended pdf schedules to: ' + sendeddEmails);
  payloadAsFile.setTrashed(true);

  if(failedEmails){
     Utils.logError('Failed to send to: ' + failedEmails);
     return {success: 'Nepodařilo se odeslat emaily na tyto adresy: ' + failedEmails};
  }

  return {success: 'Všechny emaily byli v pořádku odeslány'};
}

/**
 * prepares sheets for clients and sends emails
 *
 * @param email email address
 * @param body body of email
 * @param mainSheetData data to insert into sheet
 * @param mainSS main SpreadSheet resource
 * @param payloadSS SpreadSheet for email attachment
 * @param mainSheet main sheet resource
 * @param payloadSheet sheet for email attachment
 * @param payloadAsFile link to drive for email attachment
 * @param {Object} opts received URL params and loaded data
 * @return {string} success string
 */
function preparePayloadAndEmail(email, body, mainSheetData, mainSS, payloadSS, mainSheet, payloadSheet, payloadAsFile, opts){
  var names = manager.clients[email].names;
  var mainSheet = mainSS.getSheetByName('Rozpis');
  var payloadSheet = payloadSS.getActiveSheet();

  Utils.copyDataBetweenSheets(mainSheet, payloadSheet, mainSheetData, [], names, true);
  payloadSheet.getRange(1, 1).setValue('Rozpis ' + names.join(', '));

  SpreadsheetApp.flush();

  MailApp.sendEmail({
    to: email,
    subject: 'Rozpis pro týden ' + opts.week,
    body: body,
    attachments: [payloadAsFile.getAs(MimeType.PDF)]
  });
}
