# DEV30 — 0.30.1-dev30 / Android 32

## Deterministic entry failure found by static inspection

DEV29 added 16 mandatory texture names such as `weapons29/rifle-color.webp` to `ITEM_FILES16`. The world loader recognized only `pbr12/` and `items16/` as banks directly under `assets/`; it prepended `textures/` to every other texture name. Consequently, every entry requested `assets/textures/weapons29/*.webp` although the packaged files are in `assets/weapons29/`. The mandatory asset job rejected and `startGame` returned to the front menu. This path is shared by new and saved worlds; retrying or deleting a save cannot repair a package URL.

`asset-path30.js` now maps names with a bank path directly under `assets/`, and bare legacy names under `assets/textures/`. The loader uses this resolver for every texture. A static inventory of declarations and packaged files found all 32 declared models and 71 declared textures present at the corrected locations. This was filesystem/source inspection, not a game, browser or test execution.

## Visible diagnosis and retry cleanup

Non-cancellation entry failures now open a prominent alert dialog above the front menu on desktop and mobile. It shows the last loading stage and error message, with a selectable/copyable technical report. Only this report is stored in `oskol.last-entry-error`, separate from the existing game save and backup. Escape/Android Back and the menu button close the dialog; keyboard focus is contained while it is open. Explicit cancellation remains a normal menu return, not an error dialog.

The entry progress callback records the actual current stage. Non-Error thrown values are normalized for reporting. Failed-world cleanup detaches the global world reference before disposal and guards cleanup exceptions, with a best-effort renderer/listener cleanup; a secondary cleanup exception must not hide the original error or leave the failed object selected for another attempt. Audio cleanup errors cannot prevent the failure UI.

## Compatibility and delivery

Android version code 32, same application ID and development signing key. Windows uses the same saved-data path. Save schema, terrain revision 14, inventories, 155 approved icons and all existing gameplay features are unchanged. Install over the old version; do not uninstall or clear application data to apply this hotfix. A new world is not required.

The existing build-only workflow publishes standalone APK, portable EXE and SHA256SUMS.txt to a prerelease. Release notes link to the document for the current iteration rather than always DEV29. Actions ZIPs remain internal build transport and are not the installation links.

## Validation boundary

Changed JavaScript syntax checks, static package-path inspection, esbuild compilation, Gradle APK compilation and Electron packaging only. **No unit/browser/native/emulator/smoke/gameplay/runtime/visual tests or application launches.** Fixing the confirmed mandatory asset-path failure does not establish that every device-specific or unrelated entry failure is resolved. If another failure remains, the visible report supplies the stage and cause without asking the user to erase their world.
