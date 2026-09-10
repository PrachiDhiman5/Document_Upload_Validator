const { startTestServer, request } = require('./helpers');

describe('Test Case 003 — POST /api/documents (missing-boundary-check sizeKB <= 0)', () => {
  startTestServer();

  test('should reject non-positive sizeKB values (0 and negative numbers)', async () => {
    // 1. Submit sizeKB: 0 -> Expected: HTTP 400 Bad Request
    const zeroRes = await request('POST', '/api/documents', {
      fileName: 'zero_size.pdf',
      mimeType: 'pdf',
      sizeKB: 0,
      docType: 'PAYSLIP'
    });
    expect(zeroRes.status).toBe(400);
    expect(zeroRes.body.status).not.toBe('ACCEPTED');

    // 2. Submit sizeKB: -1 -> Expected: HTTP 400 Bad Request
    const negRes = await request('POST', '/api/documents', {
      fileName: 'negative_size.pdf',
      mimeType: 'pdf',
      sizeKB: -1,
      docType: 'PAYSLIP'
    });
    expect(negRes.status).toBe(400);
    expect(negRes.body.status).not.toBe('ACCEPTED');
  });
});
