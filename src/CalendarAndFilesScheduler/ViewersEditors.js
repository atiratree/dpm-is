
/**
 * Refreshes viewwers and editors for a file
 * @param {Object} file
 * @param {Array} viewers
 * @param {Array} editors
 */
function refreshViewersAndEditors(file, viewers, editors) {
    const owner = file.getOwner().getEmail();

    // do not care about the owner
    viewers.delete(owner);
    editors.delete(owner);


    //remove excess viewers
    file.getViewers().forEach((user) => {
        try {
            const email = user.getEmail();

            if (viewers.has(email)) {
                viewers.delete(email);
            } else {
                file.removeViewer(email);
            }
        } catch(e) {
            catchUserError(user, e);
        }
    });

    // remove excess editors
    file.getEditors().forEach((user) => {
        try {
            const email = user.getEmail();

            if (editors.has(email)) {
                editors.delete(email);
            } else {
                file.removeEditor(email);
            }
        } catch(e) {
            catchUserError(user, e);
        }
    });

    // add viewers
    viewers.forEach((email) => {
        try {
            file.addViewer(email);
        } catch (e) {
            Utilities.sleep(1000);
            Utils.logCorrection(email + ": " + e);
        }
    });

    // add editors
    editors.forEach((email) => {
        try {
            file.addEditor(email);
        } catch (e) {
            Utilities.sleep(1000);
            Utils.logCorrection(email + ": " + e);
        }
    });
}

const catchUserError = (user, e) => {
    Utilities.sleep(1000);
    let email = ""
    try {
        email = user.getEmail()
    } catch(ignored) {}
    Utils.logCorrection(email + ": " + e);
}
