# My bug report — 03

You reported 13 confirmed bugs. For Phase 2, write an automated test that FAILS because of each one — fixing them is an optional bonus.

## 1. POST /api/documents — wrong-status-code

Issue: API returns HTTP 200 for both accepted and rejected document submissions, never using 201 or 400.
Expected vs actual: Expected: 201 for accepted docs, 400 for rejected docs (per spec). Actual: both return 200 regardless of outcome — confirmed with one accepted and one rejected POST, both returning 200.

## 2. POST /api/documents — missing-required-field

Issue: fileName validation checks presence but not blankness — omitting the field is rejected, but an empty string is accepte
Expected vs actual: Expected: fileName: "" should be rejected (spec requires non-blank). Actual: accepted and stored with status ACCEPTED. (Note: field omitted entirely IS correctly rejected — shows the bug is specifically blank vs missing).

## 3. POST /api/documents — missing-boundary-check

Issue: The spec says sizeKB must be "a number greater than 0." To test the lower boundary properly, I submitted three values one at a time, keeping fileName, mimeType, and docType valid each time: -1, 0, and 1. According to the rule, -1 and 0 should both be rejected (0 is not greater than 0), and 1 should be accepted. I found that all three were accepted, including the negative value and zero. This means there's effectively no lower-bound check being enforced on sizeKB at all — the validation appears to only be checking the upper bound (which itself has a separate bug, see the next report), not the lower one. A negative file size doesn't make sense in any real-world context, so this could let genuinely invalid data into the system.
Expected vs actual: Expected: sizeKB = -1 → rejected (400). sizeKB = 0 → rejected (400), since the value must be strictly greater than 0. sizeKB = 1 → accepted (this one is correct). Actual: sizeKB = -1 → accepted and stored. sizeKB = 0 → accepted and stored. sizeKB = 1 → accepted (correct, included for comparison).

## 4. POST /api/documents — off-by-one-boundary

Issue: The spec is very explicit about the upper boundary: "sizeKB is a number greater than 0 and less than or equal to 5120 (a file exactly at 5120 KB is accepted; anything over 5120 KB is rejected)." I tested the exact boundary value and the value immediately past it, with everything else valid. sizeKB: 5120 was rejected with the reason "File too large" — this directly contradicts the spec, which explicitly calls out that exactly 5120 should be accepted. sizeKB: 5121 was also rejected, which is correct behavior. Since 5121 behaves correctly and 5120 doesn't, this looks like a classic off-by-one error in the comparison — the validation is almost certainly using a strict less-than check (sizeKB < 5120) instead of less-than-or-equal (sizeKB <= 5120), which excludes the one value the spec goes out of its way to call accepted.
Severity: High. The spec singles out exactly this value as a required test case ("a file exactly at 5120 KB is accepted"), so this is a documented, deliberate boundary that the implementation fails outright — a legitimate maximum-size document is wrongly rejected every time.
Expected vs actual: Expected: sizeKB = 5120 → accepted (this is explicitly stated as the inclusive maximum in the spec). sizeKB = 5121 → rejected. Actual: sizeKB = 5120 → rejected with reason "File too large." sizeKB = 5121 → rejected (correct, included for comparison, confirms the boundary itself is one value off).

## 5. UI — missing-ui-feedback-guard

Issue: The UI spec states: "a success message is shown only when the document is actually accepted; a rejected or failed submission shows an error message instead — the two must never both look like success." I filled out the upload form with values that should cause a rejection (for example, a size that violates the boundary rules, or a duplicate identity document) and submitted it. The UI displayed the same "submitted successfully" style confirmation that it shows for a genuinely accepted document — there was no visual difference between a rejected submission and a successful one. This is a meaningful usability problem beyond just being spec-noncompliant: a real candidate uploading a document during a background verification process would have no way of knowing their document was actually rejected, and might assume their submission is complete when it isn't. This likely happens because the frontend isn't actually checking the "status" field in the API response (or the HTTP status code, which is also wrong per Bug 1) before deciding which message to show — it appears to just show "success" whenever the request itself completes without a network error.
Severity: High. This directly misleads the end user about whether their action succeeded — in a real BGV workflow, a candidate could believe a rejected document was accepted and never re-upload a valid one, causing their verification to silently stall.
Expected vs actual: Expected: When a submission is rejected, the UI should display a clear error or rejection message, distinct in appearance and wording from a successful submission. Actual: The UI shows the same success-style message ("submitted successfully" or equivalent) regardless of whether the document was actually accepted or rejected by the API.

## 6. UI — wrong-format-display

Issue: The UI spec for the documents table says it should show "size (displayed in KB, matching what was submitted)." I submitted a document with a known, specific size in KB (for example, 3400 KB) and then checked how that value is rendered in the Documents table. Instead of showing 3400 KB as submitted, the table displays the value converted into MB (or labeled as MB), so the number and/or unit shown no longer matches what was actually sent to the API. This makes it harder to verify sizes against the 5120 KB limit at a glance, since the table isn't showing the same unit the validation rule and the API operate in — a user checking whether their document is close to the size limit has to mentally convert MB back to KB to make sense of it.
Severity: Low–Medium. Purely a display/formatting issue — no data is lost or corrupted, but it makes it harder for a user to judge how close a document is to the 5120 KB limit at a glance, and it technically violates the documented UI spec.
Expected vs actual: Expected: The Size column in the documents table should display the value in KB, matching exactly what was submitted in the request (e.g. 3400 KB). Actual: The table displays the size converted to (or labeled as) MB, not matching the submitted KB value.

## 7. UI — wrong-dropdown-default-selection

Issue: The UI spec states: "Mime Type dropdown has no default selection forced on the candidate — the candidate must actively choose one." I opened the upload form on a fresh page load without interacting with the Mime Type dropdown at all, and it already had "PNG" pre-selected as the visible value. This means a candidate could submit the form without ever consciously choosing a mime type, and the form would silently use PNG regardless of what file they're actually uploading — for example, someone uploading a PDF document could end up submitting it with mimeType: "png" simply because they never touched the dropdown, since it looks like a normal field rather than a required choice.
Severity: Medium. It doesn't break data integrity on its own (PNG is still a valid mimeType value), but it directly contradicts an explicit UI requirement and can silently cause a mismatch between the actual file type a candidate intends to upload and what gets recorded, since the field appears "already filled in" rather than requiring deliberate input.
Expected vs actual: Expected: The Mime Type dropdown should show a neutral/placeholder state (e.g. "Select MIME type") on page load, with no value chosen, forcing the candidate to actively pick one before submitting. Actual: The dropdown loads with "PNG" already selected as the default value.

## 8. POST /api/documents — case-sensitivity-mismatch

Issue: The spec states mimeType validation is "checked case-insensitively (PDF, Jpg, PNG are all accepted)." I submitted a document with mimeType: "PDF" (uppercase), keeping fileName, sizeKB, and docType all otherwise valid. The request was rejected, even though lowercase "pdf" is accepted without issue for an identical payload. This directly contradicts the explicit case-insensitivity requirement called out in the spec — the validation logic appears to be doing an exact-match string comparison against the lowercase values only, rather than normalizing case before comparing.
Severity: Medium. This is a direct, explicitly-documented requirement violation. It's not catastrophic since a client can work around it by lowercasing the value before sending, but it's a clear functional gap between the documented contract and the implementation, and could break integrations that don't know to normalize case themselves.
Expected vs actual: Expected: mimeType: "PDF" (or any case variation like "Pdf", "pdf") should be accepted, since the spec explicitly requires case-insensitive matching. Actual: mimeType: "PDF" is rejected, while the identical payload with mimeType: "pdf" is accepted.

## 9. POST /api/documents — missing-enum-validation

Issue: The server fails to validate the docType field against the allowed enumeration (PAN, AADHAAR, PAYSLIP, DEGREE). When sending arbitrary non-enum strings (such as docType: "PASSPORT", invalid random strings, or lowercase variations like docType: "payslip"), the backend accepts the payload and returns 200 OK with status: "ACCEPTED". The server must restrict docType strictly to the four documented values and reject invalid inputs with a 400 Bad Request. Severity: High. Accepting unvalidated document types corrupts downstream verification pipelines and breaks business domain constraints.
Expected vs actual: Expected: Submitting an unrecognized document type (e.g., "PASSPORT" or empty string) must return HTTP 400 with an error indicating an invalid document type.
Actual: Returns HTTP 200 with status: "ACCEPTED" and stores/evaluates the record as valid.

## 10. DELETE /api/documents/:id — wrong-status-code

Issue: The spec specifies that DELETE /api/documents/:id must return 404 if no document exists with that ID. When calling DELETE /api/documents/9999 (or any non-existent ID), the API returns HTTP 200 OK with {"success": true} instead of HTTP 404 Not Found. Severity: Medium. Violates REST semantics and prevents clients from detecting whether a target resource actually existed and was deleted.
Expected vs actual: xpected: HTTP 404 Not Found when attempting to delete a document ID that does not exist.
Actual: HTTP 200 OK with body {"success": true}.

## 11. UI — wrong-status-badge-color

Issue: In the frontend rendering,  the CSS class assignment for document status badges is inverted: const badgeClass = d.status === "ACCEPTED" ? "rejected" : "accepted";. As a result, ACCEPTED documents are styled with the red .rejected badge, and REJECTED documents are styled with the green .accepted badge. Severity: Medium. Causes misleading visual indicators where valid documents appear rejected to the user.
Expected vs actual: Expected: ACCEPTED status should render with a green/success styling class (accepted), and REJECTED with a red/danger styling class (rejected).
Actual: ACCEPTED is assigned the rejected class (red) and REJECTED is assigned the accepted class (green).

## 12. POST /api/documents — state-not-persisted

Issue: The specification states: "If the document passes all validation rules: it is stored with status ACCEPTED... GET /api/documents: Returns 200 with a JSON array of all stored (accepted) documents." When a valid document is submitted via POST /api/documents and the server returns an accepted response, querying GET /api/documents immediately afterward reveals that the newly accepted document was never saved to the collection. The document list remains unchanged and contains only the initial seed data. Severity: High. Core business functionality failure — newly uploaded documents are lost and cannot be retrieved by subsequent reads.
Expected vs actual: Expected: A document accepted via POST /api/documents must be persisted and appear in subsequent GET /api/documents calls.
Actual: GET /api/documents only returns the initial seed records; newly uploaded documents disappear immediately.

## 13. POST /api/documents — wrong-filter-boolean-logic

Issue: The identity document uniqueness rule explicitly mandates: "PAN and AADHAAR are identity documents: a submission is rejected if an ACCEPTED document of the same docType already exists, regardless of fileName." When testing POST /api/documents with docType: "PAN" and a new file name ("new_pan.pdf"), the server accepts it (status: "ACCEPTED"). However, when submitting with fileName: "pan_card.pdf" (which matches the existing seed record's file name), it gets rejected with "A PAN document is already on file". This demonstrates that the server's uniqueness filter incorrectly joins the criteria with boolean AND logic (existing.fileName === input.fileName && existing.docType === input.docType) instead of evaluating existing documents purely by existing.docType === input.docType. Severity: High. Compromises the identity uniqueness integrity constraint by allowing duplicate PAN/AADHAAR records whenever the file name differs.
Expected vs actual: Expected: Uniqueness check should query purely on docType === "PAN" (or "AADHAAR"), rejecting any duplicate submission regardless of fileName.
Actual: Evaluates fileName == existing.fileName AND docType == existing.docType, erroneously permitting duplicate identity documents when file names differ.

