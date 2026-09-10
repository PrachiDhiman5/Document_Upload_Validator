const { startTestServer, request } = require('./helpers');

describe('Test Case 001 — POST /api/documents (wrong-status-code)', () => {
  startTestServer();

  test('should return HTTP 201 for valid accepted documents and HTTP 400 for rejected documents', async () => {
    // 1. Submit a valid document -> Expected: HTTP 201 Created
    const validRes = await request('POST', '/api/documents', {
      fileName: 'valid_payslip.pdf',
      mimeType: 'pdf',
      sizeKB: 100,
      docType: 'PAYSLIP'
    });
    expect(validRes.status).toBe(201);

    // 2. Submit an invalid document (unsupported mimeType) -> Expected: HTTP 400 Bad Request
    const invalidRes = await request('POST', '/api/documents', {
      fileName: 'invalid_doc.gif',
      mimeType: 'gif',
      sizeKB: 100,
      docType: 'PAYSLIP'
    });
    expect(invalidRes.status).toBe(400);
  });
});
