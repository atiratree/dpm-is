/**
 * Locks this script.
 * Implements HACK for locking, because of this bug https://code.google.com/p/google-apps-script-issues/issues/detail?id=2274
 * It can take 5-15 seconds to lock. Most of the time locks instantly.
 */
function lock_() { //
  try {
    LockService.getScriptLock().waitLock(manager.waitForLockTime);
  } catch (x) {
    try {
      Utilities.sleep(manager.sleepConstantForLockBug);
      LockService.getScriptLock().waitLock(manager.waitForLockTime);
    } catch (ex) {
      logError(ex);
    }
  }
}

/**
 * Unlocks this script.
 * Implements HACK for unlocking, because of this bug https://code.google.com/p/google-apps-script-issues/issues/detail?id=2274 which is valid for unlocking too.
 * It can take 3 seconds to unlock. Most of the time unlocks instantly.
 */
function unlock_() {
  try {
    LockService.getScriptLock().releaseLock();
  } catch (x) {
    try {
      Utilities.sleep(manager.sleepConstantForUnlockBug);
      LockService.getScriptLock().releaseLock();
    } catch (ex) {
      logError(ex);
    }
  }
}

//functions for debugging purposes

function clearLog_(logSheet) {
  var sheet = logSheet ? logSheet : manager.errSheet;
  sheet.clear();
}

function logDebug(msg) {
  logToSheet_(msg, manager.logSheet, true, manager.logSize);
  logToSheet_(msg, manager.errSheet, true, manager.errorsLogSize);
}