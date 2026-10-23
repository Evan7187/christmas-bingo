GOESSEL CHRISTMAS BINGO - LOCAL-FIRST PHOTO UPDATE
================================================
This is replacement code, not a deployment. Nothing on your live site, spreadsheet,
or Drive was changed while preparing this package.

FILES
-----
Google Apps Script: Code.gs and Admin.gs
GitHub Pages: index.html, app.js, and sw.js (all three in the same folder)
Do NOT publish Code.gs or Admin.gs in your public GitHub repository.

WHAT CHANGES
------------
* Photos save to IndexedDB on the playing device. Attaching a photo makes NO API
  call and does not upload it. Cards, photo order, and first-Bingo count persist.
* An already-prepared page can reopen offline using sw.js. First-time setup and
  creating a new player still need internet. Existing local players switch offline.
* Contact information is requested at submission, not while taking photos.
* Admin!B26 is the new Photo submission mode dropdown. Default: All photos.
  All photos: uploads each completed square's photo at submission.
  Winning photos only: uploads the photos in ONE currently completed line (four
  if it includes FREE, five otherwise).
  Card image only: uploads NO separate square photos.
  Every mode submits the organizer card image and the no-contact shareable image.
* The organizer card is 1892 x 2152 pixels. The full photo is fitted above its
  clue label instead of being cropped. Individual uploads retain more detail.
* New Entries columns N-Q: CluesCompletedAtBingo, PhotosAtSubmission,
  PhotoSubmissionMode, HistorySource. Existing columns A-M retain their positions.
* First-Bingo count excludes FREE and counts distinct squares. Replacing a photo
  does not add a clue. Continuing after Bingo does not change the first count.
* IMPORTANT: this measures PHOTO-ATTACHMENT ORDER, not the time/order in which
  the camera took photos. If a player attaches photos later, that is the order
  recorded. It is device-reported game data, not independent proof of the hunt.
* Old cards with unknown attachment history are labeled Unknown (legacy card).
  Existing entries are not backfilled or modified.
* A submission snapshots the spreadsheet mode. Retrying keeps that mode even if
  you change B26. Confirmed uploads are reused. The card locks for editing once
  submission starts; retry Submit Bingo to finish after an interruption.
* Your two print writing lines, page-1 example, page-2 reminder, prizes, dates,
  multiple players, recovery codes, drawing and review tools are retained.
* New cards snapshot their clue text. Changing the Clues tab affects NEW cards,
  not cards already issued. Finalize the clues before launch.
* Sync Card becomes Refresh Status. It refreshes settings/status, not photo uploads.

IMPLEMENTATION ON YOUR EXISTING PROJECT
--------------------------------------
1. BACK UP FIRST. Save your current index.html, Code.gs and Admin.gs separately.
   Keep a private spreadsheet copy and any needed photos. This ZIP is the NEW
   code; it is not a backup of your live spreadsheet or Drive data.
2. Pause the event: uncheck Admin!B7. Keep it paused during the coordinated update.
   Existing old browser tabs must be closed/reloaded after the update.
3. Extract this ZIP. Open Code.gs in a plain-text editor, select all its contents,
   and replace the entire Code.gs in your EXISTING Apps Script project. Do the
   same with Admin.gs. Save BOTH. Do not add duplicate copies or keep old Part2.gs.
   Do not run setup. Do not create a new spreadsheet or project.
4. In Apps Script, run installAdmin once. Approve requested permissions if needed.
   This updates the existing spreadsheet, adds B26 and columns N-Q, and refreshes
   the existing on-edit trigger. It does NOT reset entries, clues, dates or photos.
   Existing Admin B4:B24 locations stay the same. Check B26 says All photos.
5. Update the EXISTING deployment: Deploy > Manage deployments > select the active
   deployment > Edit (pencil) > Version: New version > Deploy.
   Keep the existing execute-as/access settings. Do not create a different URL.
6. In your GitHub Pages publishing folder, replace index.html and add app.js and
   sw.js alongside it. Commit all three together. Do not paste .gs code into Wix.
   The existing endpoint from your supplied HTML is already in app.js.
7. For a test, set B4 to a time before now, B5 to a future time, and B6 after B5.
   Re-enable B7. Refresh the published game. Confirm the normal game page loads
   and the offline-preparation message appears. Use a NEW test player card.
8. After testing, restore your intended event dates and switch. A paused event
   remains paused until B7 is checked. Refresh the game to pick up changed settings.

TEST CHECKLIST ON YOUR OWN IPHONE
--------------------------------
[ ] Open online and create a card. Confirm offline preparation message.
[ ] Turn on airplane mode. Attach photos to several squares. No upload required.
[ ] Close/reopen or reload the SAME published page offline. Photos should remain.
[ ] Switch between two players created earlier while online.
[ ] Complete Bingo. Message is simply You have Bingo! No connect-to-internet text.
[ ] Tap Not Now, add more photos, and confirm first-Bingo count stays unchanged.
[ ] Reconnect. Submit with name and phone OR email plus consent.
[ ] Check Entries N-Q, BingoType, photo links, CardPicture, and DuplicateCheck.
[ ] Test each B26 mode with a NEW test card. Change mode before submission starts.
[ ] Interrupt a submission and retry. Already-confirmed uploads should be reused.
[ ] Print: two Letter pages, 24 second location lines, page-1 example retained.
[ ] Open the organizer JPG and zoom in on a real night photo for quality review.

OFFLINE / RECOVERY LIMITS
------------------------
Offline reopening requires a successful online visit and service-worker install
on the published HTTPS site (or localhost for development), not opening a local
HTML file. It is not a promise of permanent storage. Browsers can clear/evict
local data; private browsing, clearing website data, changing browser or changing
website origin can lose local photos. Keep original camera photos and use the
same device/browser until submission is confirmed. A recovery code cannot restore
photos the server has never received. In Card image only mode the organizer has
all submitted photos inside the composite image, but separate photo-square
restoration on a different device is not available.
An offline device cannot learn that the organizer paused/reset/changed the event
until it reconnects. The server always enforces current dates and pause status
when preparing uploads or accepting the entry. Submit before the deadline.

ADMIN SAFETY CHANGES
--------------------
Reset is NOT needed to install this update. Do not use Reset on real entries.
If deliberately resetting test data: type RESET in B21, then check B22. Reset
clears Cards/Entries/Winners, rotates the private upload folder and event ID,
trashes the old photo folder, and leaves B7 UNCHECKED. Settings and clues stay.
It does not permanently erase Drive data or clear photos on players' devices.
Check the result in B24. Re-enable only when you are ready.
Pick winners uses Approved entries only, records results once, and sends no
messages. Resolve duplicate flags manually, especially families sharing contact
information. There is no automatic AI image matching or automatic approval.

ROLLBACK
--------
Keep the old source files, old deployment version, and spreadsheet backup.
Rollback is simplest BEFORE anyone uses the new version. After local-first play
starts, do not revert casually: unsubmitted photos may exist only on phones, and
older code cannot read the new IndexedDB version. Do not clear browser storage
as a troubleshooting step. Pause and preserve data first.

VALIDATION PERFORMED HERE
-------------------------
JavaScript syntax checked. Node tests with simulated Sheets/Drive verified all
three modes, required-photo checks, retry idempotency, first-Bingo history,
duplicate flags, invalid settings, install preservation, drawing and reset safety.
Chromium tests with a mocked API verified no uploads during play, real cached
page reload with API unavailable, local photo persistence, offline player switching,
all three submission modes, interrupted-upload resume, mode snapshotting, and
1892 x 2152 organizer images. Print rendering was two pages with retained details.
These are local/simulated tests, NOT a live Google Apps Script/Drive deployment
or a physical iPhone test. Run the checklist above before public launch.

REFERENCE DOCUMENTATION
-----------------------
Service workers: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
Browser storage: https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
Deployment versions: https://developers.google.com/apps-script/guides/versions
