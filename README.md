GOESSEL CHRISTMAS BINGO - REVISION 2
===================================
Replacement code, not a live deployment. No live spreadsheet, site, or photos
were changed while building this package.

IMPLEMENTED CHANGE LIST
-----------------------
1. + New Player generates and saves the randomized card ON THE DEVICE.
   No server request and no spreadsheet row is created by this button.
   All 24 downloaded clues are shuffled; FREE stays in the center. Layout is
   saved and stays fixed when reopening or switching players. New players can
   be created offline after an online visit has downloaded settings and clues.
2. Register the card with the server only when submission starts. Registration
   validates the clue arrangement and event ID, and retries reuse the same card.
   The 100-card limit now limits REGISTERED cards, including incomplete submissions.
   Admin A13 is relabeled Cards registered at submission. It cannot count cards
   that exist only on phones. Existing server cards are retained.
3. Remove recovery-code UI. Internal random card identifiers remain for safe
   submissions/status lookup. Keep using the same device/browser until submission.
4. Throughout submission, show ONLY a spinner and Uploading your submission...
   No photo numbers, photo counts, file names, or upload-stage details.
   Errors remain visible when an action actually fails. Reduced-motion preference
   disables the rotation but retains the indicator and text.
5. Read Entries ReviewStatus on page open and Refresh Status:
   Pending review -> Entry received / Awaiting organizer review.
   Approved -> Your Bingo entry is approved for the drawing!
   Not approved -> Your entry needs attention. Please contact the organizer.
   Prize delivered -> Your prize is marked as delivered. Thank you for playing!
   This is NOT live push. An already-open phone updates when refreshed/reopened.
   Offline it retains the last known review status. Approval still displays after
   the contest closes. No automatic photo approval or winner notification.
6. Private test mode uses a secret-link key AND a separate spreadsheet, photo
   folder, event ID, counters, settings cache and local browser database. Test
   submissions do not enter the production drawing. The test page has a banner.
   The link is possession-based access, NOT a Google sign-in gate. Anyone with
   the link can use the test environment. Do not publish or forward it to players.

PRESERVED
---------
Admin B26 photo mode: All photos / Winning photos only / Card image only.
Local photos during play; upload at submission; resumable uploads; high-resolution
organizer card; first-Bingo count and submission photo count; multiple players;
Rename; print layout and both writing lines; page-1 example; page-2 reminder;
prizes, date controls, review tools, drawing, and reset.

EXISTING ENTRIES SCHEMA (DO NOT RENAME OR MOVE COLUMNS)
----------------------------------------------------
A Receipt                  J ShareableCard
B SubmittedUTC             K OkToShare
C Name                     L WinningClues
D Phone                    M DuplicateCheck
E Email                    N BingoType
F CardHash                 O CluesCompletedAtBingo
G PhotoReviewLinks         P PhotosAtSubmission
H ReviewStatus             Q PhotoSubmissionMode
I CardPicture              R HistorySource
New OkToShare values remain FALSE. Organizer review consent is not publication
permission. Existing rows and sharing values are not rewritten.

UPDATE YOUR EXISTING INSTALLATION
---------------------------------
1. Back up the current files and private spreadsheet. Keep original photos.
   Do NOT reset or clear browser data. Pause production using Admin B7 while
   updating. Keep the intended public opening/deadline dates unchanged.
2. Replace Code.gs AND Admin.gs in your EXISTING Apps Script project. Save both.
   Do not add duplicate files or retain old Part2.gs copies. Do not run setup.
3. Run installAdmin. It preserves existing dates, clues, entries, and photos,
   validates the schema, adds any missing headings, and updates the edit trigger.
4. Update the EXISTING deployment: Deploy > Manage deployments > select the
   active deployment > Edit/pencil > New version > Deploy. Keep the existing URL
   and access/execute-as settings. The supplied endpoint in app.js is unchanged.
5. Replace index.html, app.js AND sw.js together in the GitHub Pages publishing
   folder. Do not publish the .gs files in the public repository.
6. Close ALL open Bingo tabs/windows, then reopen the published game online.
   This lets the updated service worker activate. Do not clear website data to
   force an update; that can delete local photos. Existing cards are preserved.
7. Restore the intended production B7 setting after deployment. Before Dec 14,
   production remains upcoming if the original dates are retained. Use the
   PRIVATE TEST setup below instead of changing public dates just to test.

PRIVATE TEST SETUP (AFTER THE UPDATE)
------------------------------------
1. Run setupPrivateTest in Apps Script. It creates separate private test records
   and a separate photo folder. It does not open or reset the public contest.
   On first creation it copies the current production clue list and gives the
   test contest an open date range. Test settings are edited in the TEST sheet.
2. In your PRODUCTION spreadsheet Admin B30, paste the exact published HTTPS
   GAME address (the GitHub game itself, not the Wix front-door/button page).
   Use the normal game address without a fragment. No need to put a secret in
   public source code.
3. Run setupPrivateTest again. Existing test data is preserved.
4. PRODUCTION Admin B31 links to the test spreadsheet. B32 contains the private
   test game link. Open B32 and confirm the PRIVATE TEST MODE banner.
5. Review/approve TEST entries in the TEST spreadsheet. Refresh Status on the
   test phone to check approval. Test B26 controls test photo-upload mode.
6. Use test Admin checkbox actions for test drawing/reset. Running pickWinners
   or resetEvent directly from the editor uses production context; do not do
   that for a test. A test reset pauses only the test event; re-enable test B7
   after checking its settings.
7. Run revokePrivateTest manually if the private link is exposed. This revokes
   its key without deleting data or changing production. Run setupPrivateTest
   again to generate a replacement link. Update your bookmark to the new B32.

TEST CHECKLIST
--------------
[ ] Open private test link; banner is visible and production remains upcoming.
[ ] + New Player changes the layout, keeps FREE centered, and creates no Cards row.
[ ] Prepare online, then airplane mode: create another player and attach photos.
[ ] Reopen the SAME game page offline; players and photos remain.
[ ] Reach Bingo, add more photos, confirm first-Bingo count stays fixed.
[ ] Submit after reconnecting. Spinner text never lists photo numbers or details.
[ ] Confirm a row appears only in TEST Cards/Entries, not production.
[ ] Mark Approved in TEST Entries H; tap Refresh Status on phone.
[ ] Close/reopen the phone page; approval is still displayed.
[ ] Repeat with each test B26 mode using a fresh test card.
[ ] Print and check two Letter pages, writing lines, example, and footer.
[ ] Open organizer card and inspect a real night photo at zoom.

LIMITS AND IMPORTANT DETAILS
----------------------------
First-Bingo count is the order of distinct photo ATTACHMENTS, not the camera's
capture order or proof of the order sights were found. FREE is excluded.
Replacing a photo does not increase the clue count. Legacy cards with unknown
history remain labeled unknown, not assigned an invented count.
New cards use the cached clue list. Finalize clues before public play. If the
organizer changes the clue list after a local card is created, server validation
may reject its first submission. Do not change clues mid-event without planning
how to handle already-issued cards. Refresh Status downloads new settings for
future cards; it does not rearrange existing cards.
Offline devices cannot know about a pause/reset until they reconnect. The server
enforces current dates and event ID when accepting registration and submission.
The upload mode is snapshotted when submission starts. Retrying keeps that mode.
Before submission, photos exist only on that device. Browser data can be cleared
or evicted. Keep original camera photos and avoid private browsing. Removing
recovery-code UI does not create cross-device backup.
Private test resources share the Apps Script runtime and account quota with
production, but not the production spreadsheet or upload folder. Keep testing
small. Test links are secrets; do not include them in flyers, QR codes or Wix.

VALIDATION
----------
Local Node tests with simulated Google services verified all three upload modes,
registration retries, 18-column schema, approval lookup, invalid layout/event
rejection, test-key rejection, separate sheets/folders/counters/cache, test setup,
trigger separation, idempotent setup, and revocation/rekey.
Chromium with a mocked API verified zero API calls for +New Player, offline new
players and reopening, randomized persisted layouts, photo history, upload retry,
single spinner message, approval refresh/reopen, private local-data separation,
and retained print details. These are not live Apps Script/Drive or physical
Safari/iPhone tests. Run the checklist on your devices before public launch.

ROLLBACK
--------
Keep prior source and deployment versions. Pause and preserve data before any
rollback. Do not clear local storage/IndexedDB: it may contain the only copies
of unsubmitted photos. Old code may not understand locally created cards.
