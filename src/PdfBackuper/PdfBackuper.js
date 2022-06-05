function backupToPdf (from, to) {
  const time = new Date().toISOString();
  const ROZPIS = 'Rozpis'

  const folder = DriveApp.createFolder('Záloha_' + time);

  const tmpSS = SpreadsheetApp.create('Tmp');
  const tmpSSId = tmpSS.getId();
  const tmpSSAsFile = DriveApp.getFileById(tmpSSId);

  try {
    const stopTimer = Utils.measureTime();

    Utils.findFiles([], {
      type: ROZPIS
    }).filter(function (file) {
      return Utils.isWeekWithinDates(from, to, file.year, file.week);
    }).forEach(function (file) {

      if (stopTimer() / 1000 > 270) { // more than 270s -- abort
        throw { timeout: true };
      }

      const sourceSS = Utils.openSpreadsheet(file.id);

      const sheet = sourceSS.getSheetByName(ROZPIS) || sourceSS.getSheets()[0];

      if (sheet == null) {
        return;
      }

      // copy sheet to tmp
      tmpSS.getActiveSheet().setName('Sheet1');
      sheet.copyTo(tmpSS).setName(ROZPIS);

      tmpSS.getSheets().forEach(function (tmpSheet) {
        if (tmpSheet.getName() !== ROZPIS) {
          tmpSS.deleteSheet(tmpSheet);
        }
      });

      SpreadsheetApp.flush();
      // create pdf and move it to the folder
      let pdf;
      try {
        pdf = DriveApp.createFile(tmpSSAsFile.getAs('application/pdf'));
        pdf.setName(sourceSS.getName() + '.pdf');
        folder.addFile(pdf);
        DriveApp.getRootFolder().removeFile(pdf);
      } catch (e) {
        // cleanup on error
        if (pdf != null) {
          folder.setTrashed(true);
        }
        throw e;
      }
    });
  } catch (error) {
    folder.setTrashed(true);
    throw error;
  } finally {
    tmpSSAsFile.setTrashed(true);
  }

  if (Utils.isMainAdmin()) {
    const storageFolder = DriveApp.getFolderById(Utils.manager.storageID);
    storageFolder.addFolder(folder);
    DriveApp.getRootFolder().removeFolder(folder);
  }

  return folder.getUrl();
}
