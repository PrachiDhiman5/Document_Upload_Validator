# Document Upload Validator — QA & Test Automation Project

This repository contains the complete QA test automation suite, bug verification tests, and subsequent bug fixes for the **Document Upload Validator** application.

---

## Table of Contents
1. [Project Overview & Architecture](#1-project-overview--architecture)
2. [Document Validation Rules & Contract](#2-document-validation-rules--contract)
3. [The 13 Confirmed Bugs & Root Causes](#3-the-13-confirmed-bugs--root-causes)
4. [Test Suite Architecture & Structure](#4-test-suite-architecture--structure)
5. [How to Run and Check Tests](#5-how-to-run-and-check-tests)
6. [Bug Fixes Walkthrough (What Was Changed & Why)](#6-bug-fixes-walkthrough-what-was-changed--why)
7. [Interview Guide: Explaining Test Cases & Writing New Ones](#7-interview-guide-explaining-test-cases--writing-new-ones)

---

## 1. Project Overview & Architecture

The **Document Upload Validator** is a background verification (BGV) metadata validation system where candidates submit document metadata (`fileName`, `mimeType`, `sizeKB`, `docType`) without binary file payloads.

### Tech Stack
* **Backend:** Node.js, Express.js
* **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3
* **Testing Framework:** Jest, Supertest / Node.js HTTP Test Client
* **Isolation:** Cookie-based session isolation (`isolation.js`) allowing clean state per test session.

### API Endpoints
* `GET /api/documents` — Lists all stored (accepted) documents.
* `POST /api/documents` — Submits document metadata for validation. Returns `201 Created` if valid; `400 Bad Request` if invalid.
* `DELETE /api/documents/:id` — Removes document with given ID. Returns `200 OK` on success, `404 Not Found` if missing.
* `POST /api/reset` — Resets session store back to initial seed data.

---

## 2. Document Validation Rules & Contract

A document metadata submission is valid **only** if all of the following rules pass:
1. **`fileName`**: Required, non-blank string (`typeof fileName === 'string' && fileName.trim() !== ''`).
2. **`mimeType`**: Must be one of `pdf`, `jpg`, `png` — checked **case-insensitively** (`PDF`, `Jpg`, `PNG` are accepted).
3. **`sizeKB`**: Must be a number strictly greater than 0 and less than or equal to 5120 (`sizeKB > 0 && sizeKB <= 5120`).
4. **`docType`**: Must be strictly one of `PAN`, `AADHAAR`, `PAYSLIP`, `DEGREE`.
5. **Identity Document Uniqueness**: `PAN` and `AADHAAR` are unique identity documents. If an `ACCEPTED` document of the same `docType` already exists, a new submission of that `docType` must be rejected, **regardless of the `fileName`**.

---

## 3. The 13 Confirmed Bugs & Root Causes

| Bug # | Endpoint / Area | Defect Type | Root Cause & Problem Description |
| :--- | :--- | :--- | :--- |
| **01** | `POST /api/documents` | `wrong-status-code` | Returned HTTP `200 OK` for all requests instead of `201` for accepted and `400` for rejected submissions. |
| **02** | `POST /api/documents` | `missing-required-field` | Accepted empty strings (`fileName: ""`) and marked them as `ACCEPTED`. |
| **03** | `POST /api/documents` | `missing-boundary-check` | Did not check lower bound (`sizeKB <= 0`), accepting `0` and negative sizes (`-1`). |
| **04** | `POST /api/documents` | `off-by-one-boundary` | Comparison logic used `sizeKB >= MAX_SIZE_KB`, incorrectly rejecting valid `5120 KB` files. |
| **05** | `UI` | `missing-ui-feedback-guard` | Form submission handler unconditionally displayed a success toast even when uploads failed. |
| **06** | `UI` | `wrong-format-display` | Documents table rendered file sizes with the unit `MB` instead of `KB`. |
| **07** | `UI` | `wrong-dropdown-default-selection` | Mime Type dropdown pre-selected `PNG` by default instead of forcing an active user selection. |
| **08** | `POST /api/documents` | `case-sensitivity-mismatch` | Compared `mimeType` using exact case, rejecting valid uppercase inputs like `"PDF"` and `"Jpg"`. |
| **09** | `POST /api/documents` | `missing-enum-validation` | Failed to validate `docType` against allowed enum values, accepting arbitrary strings like `"PASSPORT"`. |
| **10** | `DELETE /api/documents/:id` | `wrong-status-code` | Deleting a non-existent document ID (`9999`) returned `200 OK` instead of `404 Not Found`. |
| **11** | `UI` | `wrong-status-badge-color` | Inverted status badge CSS classes (`ACCEPTED` got red `.rejected`, `REJECTED` got green `.accepted`). |
| **12** | `POST /api/documents` | `state-not-persisted` | Rejected documents were erroneously pushed into the main documents store and returned in `GET /api/documents`. |
| **13** | `POST /api/documents` | `wrong-filter-boolean-logic` | Identity uniqueness checked `d.fileName === fileName` instead of `d.docType === docType`, allowing duplicate PANs. |

---

## 4. Test Suite Architecture & Structure

The test suite is organized into modular files inside the `test_cases/` directory:

```text
test_cases/
├── helpers.js                                                 # Shared test server & HTTP client
├── testcase-001-wrong-status-code.test.js                     # Bug 1: 201/400 status codes
├── testcase-002-missing-required-field-filename.test.js       # Bug 2: Empty fileName rejection
├── testcase-003-missing-boundary-check-sizekb-lower.test.js   # Bug 3: sizeKB <= 0 boundary
├── testcase-004-off-by-one-boundary-sizekb-5120.test.js       # Bug 4: sizeKB == 5120 upper bound
├── testcase-005-missing-ui-feedback-guard.test.js             # Bug 5: UI toast on rejection
├── testcase-006-wrong-format-display-size-mb.test.js          # Bug 6: Table displays KB, not MB
├── testcase-007-wrong-dropdown-default-selection.test.js      # Bug 7: MimeType default dropdown
├── testcase-008-case-sensitivity-mismatch-mimetype.test.js    # Bug 8: Case-insensitive mimeType
├── testcase-009-missing-enum-validation-doctype.test.js       # Bug 9: docType enum validation
├── testcase-010-wrong-status-code-delete-404.test.js          # Bug 10: DELETE 404 on missing ID
├── testcase-011-wrong-status-badge-color.test.js              # Bug 11: Badge CSS class mapping
├── testcase-012-state-not-persisted-rejected-docs.test.js     # Bug 12: Exclusion of rejected docs
└── testcase-013-wrong-filter-boolean-logic-pan-duplicate.test.js # Bug 13: Duplicate PAN uniqueness
```

### How `helpers.js` Works
1. **`startTestServer()`**: Spawns an isolated instance of `server.js` on port `3055` before tests run (`beforeAll`), and gracefully terminates the process when tests complete (`afterAll`).
2. **`beforeEach()`**: Calls `POST /api/reset` before every test case to guarantee clean state and prevent test pollution.
3. **`request(method, path, body)`**: Sends HTTP requests and maintains session cookies across calls.

---

## 5. How to Run and Check Tests

### Run all 13 test suites:
```bash
npm test
```

### Run an individual test case:
```bash
npx jest test_cases/testcase-001-wrong-status-code.test.js
```

### Understanding Test Output:
* **`FAIL` (Red):** The application violates the specification (verifies the bug is present).
* **`PASS` (Green):** The application satisfies all assertions and the bug is resolved.

---

## 6. Bug Fixes Walkthrough (What Was Changed & Why)

### 1. `server.js` — Validation & Route Fixes
* **`validateDocument()`**:
  * Added non-blank string check for `fileName`: `if (typeof fileName !== "string" || fileName.trim() === "")`.
  * Added case normalization for `mimeType`: `mimeType.toLowerCase()`.
  * Fixed size boundaries: `if (sizeKB <= 0 || sizeKB > MAX_SIZE_KB)`.
  * Enforced allowed enum for `docType`: `if (!ALLOWED_DOC_TYPES.includes(docType))`.
  * Fixed identity uniqueness rule to check `d.docType === docType && d.status === "ACCEPTED"`.
* **`app.post("/api/documents")`**:
  * If invalid: Returns `400 Bad Request` and **does not** store the document.
  * If valid: Returns `201 Created` with stored document.
* **`app.delete("/api/documents/:id")`**:
  * Uses `findIndex(d => d.id === id)` instead of array index offset.
  * Returns `404 Not Found` if document ID does not exist.

### 2. `public/app.js` — UI Frontend Fixes
* **Status Badge**: Fixed class mapping to `d.status === "ACCEPTED" ? "accepted" : "rejected"`.
* **Size Unit**: Fixed table display to `<td>${d.sizeKB} KB</td>`.
* **Toast Notification**: Added check for `res.status === 201` before displaying success; displays `showToast(data.reason, "error")` on rejection.
* **DOM Deletion**: Removed the row from the DOM on successful delete (`row.remove()`).

### 3. `public/index.html` — Form Template Fix
* Added `<option value="">Select MIME type</option>` placeholder so `PNG` is not selected by default.


## 7. Final Test Execution Results

After applying all bug fixes:
```text
Test Suites: 13 passed, 13 total
Tests:       13 passed, 13 total
Snapshots:   0 total
Time:        3.248 s
Ran all test suites.
```
