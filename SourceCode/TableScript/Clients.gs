/**
 * Loads data for Clients Table.
 * Doesn't permit access for assistant.
 *
 * @return dataTable object or empty object
 */
function getClientsTable() {
  if(!Utils.hasAccessTo(Utils.AccessEnums.CLIENT,Utils.PermissionTypes.VIEW)){
    return {};
  }
  
  var clients = Utils.sort(Utils.findClients(), 'name');
  var canEdit = Utils.hasAccessTo(Utils.AccessEnums.CLIENT,Utils.PermissionTypes.EDIT);  
  var dt = {
    cols:[
      {id:0, label:'Název StringFilter', type: 'string', isNumber:false, isDate:false},
      {id:1, label:'Email StringFilter', type: 'string', isNumber:false, isDate:false},
      {id:2, label:'Náleží do skupin csvFilter', type: 'string', isNumber:false, isDate:false},
      {id:3, label:'' , type: 'string', isNumber:false, isDate:false},
      {id:3, label:'' , type: 'string', isNumber:false, isDate:false}
    ],
    rows:[]
  };
  
  for(var i = 0; i < clients.length; i++) {   
    dt.rows.push({
      c:[
        {v: clients[i].name},
        {v: clients[i].email},
        {v: clients[i].isInGroups.join(',')},
        {v: canEdit ? getEditButtonHtml({instance: ('client'),name:clients[i].name},500,475) : ''},
        {v: canEdit ? getDeleteButtonHtml({instance: ('client'),name:clients[i].name},500,150) : ''}
      ]
    });
  }
  
  return dt;
}