function renameFiles(oldGroupName, newGroupName) {
  const groupFiles = Utils.findFiles([], {
    type: 'Rozpis',
    group: oldGroupName
  });

  Utils.log(`renaming ${groupFiles.length} found files`);

  groupFiles.forEach((file) => {
    if (!renameFile(file, newGroupName)) {
      Utils.logError(`failed to rename ${file.id}`);
    }
  });
}

function renameFile(file, newGroupName) {
  const spreadSheet = Utils.openSpreadsheet(file.id)
  if (spreadSheet == null) {
    return false;
  }

  const sheet = spreadSheet.getSheetByName('Rozpis');
  if (sheet == null) {
    return false;
  }

  const header = sheet.getRange(1,1,1,1);
  if (header.getValue() == "" || header.getValue() == `Rozpis služeb tým ${file.group}`) { // no one has changed the default value
    // can take a long time until the write is through to the spreadsheet
    header.setValue(`Rozpis služeb tým ${newGroupName}`);
  }

  spreadSheet.rename(`${file.year}_${file.week}_${newGroupName}`)

  file.group = newGroupName
  Utils.updateFile(file)

  return true;
}
