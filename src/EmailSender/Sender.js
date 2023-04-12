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
  if(emails.length === 0){
    return {success: 'Nebyl vybrán žádný email pro odeslání!'};
  }

  var body = formObject['textArea'] == null ? '' : formObject['textArea'];
  var sheetId = opts.sheetId;
  var mainSS = SpreadsheetApp.openById(sheetId);
  var mainSheet = mainSS.getSheetByName('Rozpis') || mainSS.getSheets()[0];
  var layoutAndData = Utils.extractSpreadsheetData(mainSheet);

  var payloadSS = SpreadsheetApp.create(mainSS.getName());
  var payloadAsFile = DriveApp.getFileById(payloadSS.getId());
  var payloadSheet = payloadSS.getActiveSheet();

  var failedEmails = '';
  var sendeddEmails = ''

  // initialize main sheet
  payloadSheet.setName('Rozpis');

  // expectation is that the script runs always under the same time zone, which is Europe/Prague
  const weekStarts = Utils.findFiles(['weekStarts'], {id:sheetId}, 1).pop()['weekStarts'];
  Utils.prepareSheet(payloadSheet, new Date(weekStarts), ['Rozpis', 'týden č. ' +  opts.week, opts.year], 15, 15, true);

  // initialize clients to manager and remember body of email
  initialize(opts);
  Utils.setProp("email_sender_defaultmessage", body);

  // prepare and send
  emails.forEach(function(email){
    try{
      preparePayloadAndEmail(email, body, layoutAndData, payloadSS, payloadSheet, payloadAsFile, opts);
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
 * @param layoutAndData layout and data to write into a sheet
 * @param payloadSS SpreadSheet for email attachment
 * @param payloadSheet sheet for email attachment
 * @param payloadAsFile link to drive for email attachment
 * @param {Object} opts received URL params and loaded data
 * @return {string} success string
 */
function preparePayloadAndEmail(email, body, layoutAndData, payloadSS, payloadSheet, payloadAsFile, opts){
  var names = manager.clients[email].names;

  var cleanData = layoutAndData.data.filter(function(a) {
    return names.indexOf(a.event) > -1;
  })

  Utils.writeDataToSheet(payloadSheet, cleanData, [], 15, 15, true);
  payloadSheet.getRange(1, 1).setValue('Rozpis ' + names.join(', '));

  SpreadsheetApp.flush();

  MailApp.sendEmail({
    to: email,
    subject: 'Rozpis pro týden ' + opts.week,
    body: body,
    attachments: [payloadAsFile.getAs(MimeType.PDF)]
  });
}
