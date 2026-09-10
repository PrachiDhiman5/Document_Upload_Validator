const { startTestServer, request } = require('./helpers');

describe('Test Case 002 — POST /api/documents (missing-required-field)', () => {
  startTestServer();

  test('should reject submissions with empty string fileName', async () => {
    // Submitting fileName: "" must be rejected with HTTP 400
    const res = await request('POST', '/api/documents', {
      fileName: '',
      mimeType: 'pdf',
      sizeKB: 100,
      docType: 'PAYSLIP'
    });
    expect(res.status).toBe(400);
    expect(res.body.status).not.toBe('ACCEPTED');
  });
});
