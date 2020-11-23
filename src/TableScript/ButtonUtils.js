// serves as a source for html code snippets inserted into Awesome Table Gadget cell
var htmlManager = {
  divPart: '<div style="text-align:center"><a  onclick="',
  deleteScriptUrl: 'https://script.google.com/a/domovpromne.cz/macros/s/AKfycbwzywIGGArhKU0A7Ts7G8BauQbY6m-aK2vwvTBZSuojJjevQjEL/exec',
  editScriptUrl: 'https://script.google.com/a/domovpromne.cz/macros/s/AKfycbxqQmry9tdVC6lC14WjPPaJLSKKsi0XGjkoiOBfp_JiUVNO741n/exec',
  deleteButtonStyle: '" style="color:white!important;text-decoration:none;background-color:rgb(209,72,54); \
    background-image:-webkit-linear-gradient(top,rgb(221,75,57),rgb(209,72,54)); \
    border:1px solid rgba(0,0,0,0);border-radius:2px;display:inline-block;font-size:11px; \
    font-weight:bold;padding:0px 20px 0px 20px;text-align:left;text-transform:uppercase;white-space:nowrap;cursor: pointer;">Smazat</a></div>',
  editButtonStyle: '" style="color:white!important;text-decoration:none;background-color:rgb(54,144,209); \
    background-image:-webkit-linear-gradient(top,rgb(74,165,212),rgb(54,144,209)); \
    border:1px solid rgba(0,0,0,0);border-radius:2px;display:inline-block;font-size:11px; \
    font-weight:bold;padding:0px 20px 0px 20px;text-align:left;text-transform:uppercase;white-space:nowrap;cursor: pointer;">Edit</a></div>'
}

/**
 * Gets html of delete button which opens new window and calls our Delete script project.
 *
 * @param params params to pass into the Delete script
 * @param width width of new window
 * @param height height of new window
 * @return html of delete button
 */
function getDeleteButtonHtml(params, width, height) {
  return getButton_(params, width, height, 'delete', htmlManager.deleteScriptUrl, htmlManager.deleteButtonStyle);
}

/**
 * Gets html of edit button which opens in new window and calls our Update script project.
 *
 * @param params params to pass into the update script
 * @param width width of new window
 * @param height height of new window
 *
 * @return html of edit button
 */
function getEditButtonHtml(params, width, height) {
  return getButton_(params, width, height, 'edit', htmlManager.editScriptUrl, htmlManager.editButtonStyle);
}

/**
 * @return html composed from its parameters
 */
function getButton_(params, width, height, title, scriptUrl, buttonStyle) {
  var url = scriptUrl + constructUrlParameters(params);
  var popupFunction = new String(popupCenter).replace(/"/g, "'") + ';';
  var callPopupFunction = "popupCenter('" + url + "', '" + title + "'," + width + "," + height + ");";

  return htmlManager.divPart + popupFunction + callPopupFunction + buttonStyle;
}

/**
 * source : http://www.xtf.dk/2011/08/center-new-popup-window-even-on.html
 *
 * Creates and centers a new popup window.
 *
 * @param url url
 * @param title title
 * @param w width of new window
 * @param h height of new window
 * @return html of edit button
 */
function popupCenter(url, title, w, h) {
  // Fixes dual-screen position                         Most browsers      Firefox
  var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
  var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

  width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
  height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

  var left = ((width / 2) - (w / 2)) + dualScreenLeft;
  var top = ((height / 2) - (h / 2)) + dualScreenTop;

  var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
  // Puts focus on the newWindow
  if (window.focus) {
    newWindow.focus();
  }
}
