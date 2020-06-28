/**
 * Loads data for Clients Table.
 * Doesn't permit access for assistant.
 *
 * @return dataTable object or empty object
 */
function getClientsTable() {
  if (!Utils.hasAccessTo(Utils.AccessEnums.CLIENT,Utils.PermissionTypes.VIEW)) {
    return {};
  }

  var clients = Utils.sort(Utils.findClients(), 'name');
  var canEdit = Utils.hasAccessTo(Utils.AccessEnums.CLIENT,Utils.PermissionTypes.EDIT);
  var dt = {
    cols:[
      {id:0, label:'Název', type: 'string', stringFilter: 'true' },
      {id:1, label:'Email', type: 'string', stringFilter: 'true' },
      {id:2, label:'Náleží do skupin', type: 'string', categoryFilter: 'split' },
      {id:3, label:'' , type: 'string'},
      {id:3, label:'' , type: 'string'}
    ],
    rows:[]
  };

  for(var i = 0; i < clients.length; i++) {
    dt.rows.push({
      c:[
        {v: clients[i].name, p: { style: 'width: 30%;' }},
        {v: clients[i].email, p: { style: 'width: 30%;' }},
        {v: clients[i].isInGroups.join(','), p: { style: 'width: 20%;' }},
        {v: canEdit ? getEditButtonHtml({instance: ('client'),name:clients[i].name},500,475) : ''},
        {v: canEdit ? getDeleteButtonHtml({instance: ('client'),name:clients[i].name},500,150) : ''}
      ]
    });
  }

  return dt;
}