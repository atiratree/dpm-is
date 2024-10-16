/**
 * Creates billing spreadsheet in user's google drive and generates data into it
 *
 * @param from from which day bill is going to be created
 * @param to  to which day bill is going to be created
 * @param client name of client
 * @return {string} url of new spreadsheet
 */
function createBilling(from, to, client) {
  let groups = null;
  // TODO: we can optimize the Billing generation as follows, once a sufficient time passes and we know the group history of all clients.
  // // we need to select both status active and inactive to create a billing even for users that were removed from the group
  // const groups = Utils.convertObjectsToArrayByProperty(Utils.findGroupClients(['group'], { name: client }), 'group');
  // const groupSet = new Set(groups);
  // const spreadsheetData = Utils.extractAllSpreadsheetData(from, to, groupSet);
  const spreadsheetData = Utils.extractAllSpreadsheetData(from, to, null);
  const ss = Utils.createSpreadsheet({
    type: 'Fakturace',
    details: client
  });
  const sheet = ss.getActiveSheet();

  sheet.setName('Fakturace');
  writeToCell(sheet, 1, 1, 'Fakturace pro:');
  writeToCell(sheet, 1, 2, client);
  writeToCell(sheet, 1, 4, 'Období:');
  writeToCell(sheet, 1, 5, Utils.getFormatedDate(from, true) + ' - ' + Utils.getFormatedDate(to, true));
  if (groups != null) {
    writeToCell(sheet, 1, 7, 'Skupina/y:');
    writeToCell(sheet, 1, 8, groups.join(", "));
  }

  writeToCell(sheet, 3, 1, 'Název cenového pásma');
  writeToCell(sheet, 3, 2, 'Zkratka');
  writeToCell(sheet, 3, 3, 'Počet hodin');
  writeToCell(sheet, 3, 4, 'Cena za hodinu');
  writeToCell(sheet, 3, 5, 'Cena');

  sheet.getRange(1, 1, 1, 6).setBackground('#FFF2CC');
  sheet.getRange(3, 1, 1, 6).setBackground('#FFFEDE');

  writeBilling(spreadsheetData, sheet, client);

  return ss.getUrl();
}

/**
 * Writes billing into the sheet
 *
 * @param spreadsheetData data to write into sheet
 * @param sheet sheet
 * @param client name of client
 */
function writeBilling(spreadsheetData, sheet, client) {
  const durationsForTarriffs = {};
  const tariffs = Utils.findTariffs();
  let total = 0;
  let i = 4;

  spreadsheetData.forEach(function(item) {
    if (item.tariff && item.event && item.event === client) {
      if (!durationsForTarriffs[item.tariff]) {
        durationsForTarriffs[item.tariff] = 0;
      }

      durationsForTarriffs[item.tariff] += item.duration;
    }
  });

  tariffs.forEach(function(tariff) {
    if (durationsForTarriffs[tariff.shortcut]) {
      let subtotal;
      let hours = durationsForTarriffs[tariff.shortcut] / (60 * 60 * 1000);

      // TODO test
      hours = (hours % 1 > 0.5 || hours % 1 === 0) ? Math.ceil(hours) : (Math.floor(hours) + 0.5); // zaokrouhli na nejblizsi pul hodinu

      subtotal = tariff.price * hours;

      total += subtotal;

      writeToCell(sheet, i, 1, tariff.name);
      writeToCell(sheet, i, 2, tariff.shortcut);
      writeToCellSpec(sheet, i, 3, {
        value: hours,
        oneDigitFormat: true
      });
      writeToCell(sheet, i, 4, tariff.price);
      writeToCellSpec(sheet, i, 5, {
        value: subtotal,
        roundPrice: true,
        twoDigitFormat: true,
        color: '#E2F3FF'
      });

      i++;
    }
  });

  writeToCell(sheet, ++i, 4, 'Součet');
  writeToCellSpec(sheet, i, 5, {
    value: total,
    roundPrice: true,
    twoDigitFormat: true,
    color: '#c9daf8'
  });
}
