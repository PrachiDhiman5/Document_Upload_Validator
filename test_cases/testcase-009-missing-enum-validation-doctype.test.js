const { startTestServer, request } = require('./helpers');

describe('Test Case 009 — POST /api/documents (missing-enum-validation docType)', () => {
  startTestServer();

  test('should reject invalid document types not defined in the allowed enum', async () => {
    // docType must be one of PAN, AADHAAR, PAYSLIP, DEGREE. 'PASSPORT' is invalid.
    const invalidDocTypeRes = await request('POST', '/api/documents', {
      fileName: 'passport_copy.pdf',
      mimeType: 'pdf',
      sizeKB: 100,
      docType: 'PASSPORT'
    });
    expect(invalidDocTypeRes.status).toBe(400);
    expect(invalidDocTypeRes.body.status).not.toBe('ACCEPTED');
  });
});
