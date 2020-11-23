/**
 * Creates billing spreadsheet in user's google drive and generates data into it
 *
 * @param from from which day bill is going to be created
 * @param to  to which day bill is going to be created
 * @param client name of client
 * @return {string} url of new spreadsheet
 */
function createBilling(from, to, client) {
  var spreadsheetData = Utils.getAllSpreadSheetData(from, to);
  var ss = Utils.createSpreadsheet({
    type: 'Fakturace'
  });
  var sheet = ss.getActiveSheet();

  sheet.setName('Fakturace');
  writeToCell(sheet, 1, 1, 'Fakturace pro:');
  writeToCell(sheet, 1, 2, client);
  writeToCell(sheet, 1, 4, 'Období:');
  writeToCell(sheet, 1, 5, Utils.getFormatedDate(from, true) + ' - ' + Utils.getFormatedDate(to, true));

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
  var result = {};
  var tariffs = Utils.findTariffs();
  var total = 0;
  var i = 4;

  spreadsheetData.forEach(function(item) {
    if (item.tariff && item.event && item.event == client) {
      if (!result[item.tariff]) {
        result[item.tariff] = 0;
      }

      result[item.tariff] += item.duration;
    }
  });

  tariffs.forEach(function(item) {
    if (result[item.shortcut]) {
      var subtotal;
      var hours = result[item.shortcut] / (60 * 60 * 1000);

      hours = (hours % 1 > 0.5 || hours % 1 == 0) ? Math.ceil(hours) : (Math.floor(hours) + 0.5); // zaokrouhli na nejblizsi pul hodinu

      subtotal = item.price * hours;

      total += subtotal;

      writeToCell(sheet, i, 1, item.name);
      writeToCell(sheet, i, 2, item.shortcut);
      writeToCellSpec(sheet, i, 3, {
        value: hours,
        oneDigitFormat: true
      });
      writeToCell(sheet, i, 4, item.price);
      writeToCellSpec(sheet, i, 5, {
        value: subtotal,
        roundPrice: true,
        twoDigitFormat: true,
        color: '#E2F3FF'
      });

      i++;
    };
  });

  writeToCell(sheet, ++i, 4, 'Součet');
  writeToCellSpec(sheet, i, 5, {
    value: total,
    roundPrice: true,
    twoDigitFormat: true,
    color: '#c9daf8'
  });
}
