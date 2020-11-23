/**
 * Corrects database permissions for all empoyees
 * @param employees object of all employees
 */
function correctSitesRights(employees) {
  var emails = Utils.convertObjectsToArrayByProperty(employees, 'email');
  // OLD deprecated site - still refresh permissions
  var site = SitesApp.getSiteByUrl("https://sites.google.com/a/domovpromne.cz/rozpisy");

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


  /* not working -- but it should be ok with many requests
  try {
    site.addViewers(emails)
  } catch (e) {
    Utils.logCorrection('Sites are holding some invitations (possibly deleted accounts).');
  }  */

  emails.forEach(function(newActor) {
    try {
      Utilities.sleep(2400); // throws  exceptions if too many requests at one time
      site.addViewer(newActor);
    } catch (e) {
      if(e.message == 'Service error: SitesApp: AclEntry already exists'){
        Utils.logCorrection(newActor + ' is holding invitation');
      }else if (new RegExp('^Service error: SitesApp:  Error 502').test(e.message)){ // stupid exception
        try {
          Utilities.sleep(33000);
          site.addViewer(newActor);
        } catch (e) {
          Utils.logError(e);
        }
      }else{
        Utils.logError(e);
      }
    }
  });
  /* this stupid exception
  Service error: SitesApp:  Error 502 (Server Error)!!1 <//www.google.com/> \n\n*502.* That’s an error.
  \n\nThe server encountered a temporary error and could not complete your \nrequest.\n\nPlease try again in 30 seconds. That’s all we know.

  */
}
