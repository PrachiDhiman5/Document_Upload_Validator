const { startTestServer, request } = require('./helpers');

describe('Test Case 012 — POST /api/documents (state-not-persisted / rejected docs exclusion)', () => {
  startTestServer();

  test('should never include rejected document submissions in GET /api/documents list', async () => {
    // 1. Submit an invalid document
    await request('POST', '/api/documents', {
      fileName: 'corrupted_file.gif',
      mimeType: 'gif',
      sizeKB: 100,
      docType: 'PAYSLIP'
    });

    // 2. Query document list -> Rejected document must NOT appear
    const listRes = await request('GET', '/api/documents');
    expect(listRes.status).toBe(200);
    const hasRejectedDoc = listRes.body.some(d => d.fileName === 'corrupted_file.gif' || d.status === 'REJECTED');
    expect(hasRejectedDoc).toBe(false);
  });
});
