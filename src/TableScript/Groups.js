/**
 * Loads data for Groups Table.
 * Doesn't permit access for assistant.
 *
 * @return dataTable object or empty object
 */
 function getGroupsTable() {
  if (!Utils.hasAccessTo(Utils.AccessEnums.GROUP,Utils.PermissionTypes.VIEW)) {
    return {};
  }

  var groups = Utils.sort(Utils.findGroups(), 'group');
  var dt = {
    cols:[
      {id:0, label:'Skupina', type: 'string', stringFilter: 'true'},
      {id:0, label:'Počet řádků ve všední den', type: 'number'},
      {id:0, label:'Počet řádků o víkendu', type: 'number'},
    ],
    rows:[]
  };

  for(var i = 0; i < groups.length; i++) {
    dt.rows.push({
      c:[
        {v: groups[i].group},
        {v: groups[i].weekdayRows},
        {v: groups[i].weekendRows},
      ]
    });
  }

  return dt;
}