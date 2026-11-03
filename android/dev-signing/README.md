# Public development signing identity

`oskol-dev.p12` is an **intentionally public test key**, not a private credential.
Store format: PKCS12. Alias: `androiddebugkey`. Store/key password: `android`.

Purpose: keep the signing identity stable between iterative debug APKs, so testers
can install an update without uninstalling the app and losing local saves.
No sensitive data or production identity should rely on this key. Anyone can sign
an APK with it: download only your own trusted build and verify its checksum.
Do not reuse it for other apps, production releases, stores or access control.
A production application must get a different application ID and a real private
signing key stored outside Git, preferably via an appropriate signing service.
