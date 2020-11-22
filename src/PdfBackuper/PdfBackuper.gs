function backupToPdf(from, to) {
  var time = new Date().toISOString();
  var ROZPIS = 'Rozpis'

  var folder = DriveApp.createFolder('Záloha_' + time);

  var tmpSS = SpreadsheetApp.create('Tmp');
  var tmpSSId = tmpSS.getId();
  var tmpSSAsFile = DriveApp.getFileById(tmpSSId);

  try {
    var TIMER_ID = time;
    Utils.startTimer(TIMER_ID);

     Utils.findFiles([], {
      type: ROZPIS
    }).filter(function(file) {
       return Utils.isWeekWithinDates(from, to, file.year, file.week);
    }).forEach(function(file) {

      if (Utils.stopTimer(TIMER_ID) / 1000 > 270){ // more than 270s -- abort
        throw {timeout: true};
      }

      var sourceSS = Utils.openSpreadsheet(file.id);

      var sheet = sourceSS.getSheetByName(ROZPIS);

      if (sheet == null) {
        return;
      }

      // copy sheet to tmp
      tmpSS.getActiveSheet().setName('Sheet1');
      sheet.copyTo(tmpSS).setName(ROZPIS);

      tmpSS.getSheets().forEach(function(tmpSheet) {
        if (tmpSheet.getName() != ROZPIS) {
          tmpSS.deleteSheet(tmpSheet);
        }
      });

      SpreadsheetApp.flush();
      // create pdf and move it to the folder
      var pdf;
      try {
        pdf = DriveApp.createFile(tmpSSAsFile.getAs('application/pdf'));
        pdf.setName(sourceSS.getName() + '.pdf');
        folder.addFile(pdf);
        DriveApp.getRootFolder().removeFile(pdf);
      } catch(e) {
        // cleanup on error
        if (pdf != null) {
          folder.setTrashed(true);
        }
        throw e;
      }
    });
  } catch(error) {
    folder.setTrashed(true);
    throw error;
  } finally {
    Utils.destroyTimer(TIMER_ID)
    Drive.Files.remove(tmpSSId);
  }

  if (Utils.isSuperAdmin()) {
    var storageFolder = DriveApp.getFolderById(Utils.manager.storageID);
    storageFolder.addFolder(folder);
    DriveApp.getRootFolder().removeFolder(folder);
  }

  return folder.getUrl();
}
