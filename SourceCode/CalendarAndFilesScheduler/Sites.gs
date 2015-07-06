/**
 * Corrects database permissions for all empoyees
 * @param employees object of all employees
 */
function correctSitesRights(employees) {
  var emails = Utils.convertObjectsToArrayByProperty(employees, 'email');
  var site = SitesApp.getSiteByUrl(Utils.manager.site);

  site.getOwners().forEach(function(user) {
    emails.splice(emails.indexOf(user.getEmail()), 1);
  });
  
  site.getViewers().forEach(function(user) {
    var email = user.getEmail();
    var index = emails.indexOf(email);
    
    if (index > -1) {
      emails.splice(index, 1);
    } else {
      site.removeViewer(email);
    }
  });
  
  emails.forEach(function(newActor) {
    try {
      site.addViewer(newActor);
    } catch (e) {
      if(e.message == 'Service error: SitesApp: AclEntry already exists'){
        Utils.logCorrection(newActor + ' is holding invitation');
      }else{
        Utils.logError(e);
      }      
    }
  });
}
