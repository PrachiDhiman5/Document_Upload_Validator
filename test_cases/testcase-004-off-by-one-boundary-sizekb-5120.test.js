const { startTestServer, request } = require('./helpers');

describe('Test Case 004 — POST /api/documents (off-by-one-boundary sizeKB == 5120)', () => {
  startTestServer();

  test('should accept files exactly at the 5120 KB upper boundary limit', async () => {
    // Spec explicitly states: "a file exactly at 5120 KB is accepted"
    const boundaryRes = await request('POST', '/api/documents', {
      fileName: 'max_size.pdf',
      mimeType: 'pdf',
      sizeKB: 5120,
      docType: 'PAYSLIP'
    });
    expect(boundaryRes.status).toBe(201);
    expect(boundaryRes.body.status).toBe('ACCEPTED');
  });
});
