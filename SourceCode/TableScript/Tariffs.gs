/**
 * Loads data for Tariffs Table.
 * Doesn't permit access for assistant.
 *
 * @return dataTable object or empty object
 */
function getTariffsTable() {
  if (!Utils.hasAccessTo(Utils.AccessEnums.TARIFF,Utils.PermissionTypes.VIEW)) {
    return {};
  }

  var tariffs = Utils.sort(Utils.findTariffs(), 'name');
  var canDeleteAndEdit = Utils.hasAccessTo(Utils.AccessEnums.TARIFF,Utils.PermissionTypes.EDIT);
  var dt = {
    cols:[
      {id:0, label:'Jméno', type: 'string'},
      {id:1, label:'Zkratka', type: 'string'},
      {id:2, label:'Implicitní', type: 'string'},
      {id:2, label:'Kč/h', type: 'number'},
      {id:3, label:'' , type: 'string'},
      {id:4, label:'' , type: 'string'}
    ],
    rows:[]
  };

  for(var i = 0; i < tariffs.length; i++) {
    dt.rows.push({
      c:[
        {v: tariffs[i].name},
        {v: tariffs[i].shortcut},
        {v: (tariffs[i]['default'] ==  1) ? 'Ano' : 'Ne' },
        {v: tariffs[i].price},
        {v: canDeleteAndEdit ? getEditButtonHtml({instance:'tariff',shortcut:tariffs[i].shortcut},500,300) : ''},
        {v: (canDeleteAndEdit && tariffs[i]['default'] !=  1) ? getDeleteButtonHtml({instance:'tariff',shortcut:tariffs[i].shortcut},500,150) : ''}
      ]
    });
  }

  return dt;
}