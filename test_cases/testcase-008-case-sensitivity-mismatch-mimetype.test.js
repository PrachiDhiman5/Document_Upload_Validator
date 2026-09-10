const { startTestServer, request } = require('./helpers');

describe('Test Case 008 — POST /api/documents (case-sensitivity-mismatch)', () => {
  startTestServer();

  test('should accept uppercase and mixed-case mimeType (e.g. PDF, Jpg, PNG)', async () => {
    // 1. Uppercase PDF
    const upperRes = await request('POST', '/api/documents', {
      fileName: 'upper_test.pdf',
      mimeType: 'PDF',
      sizeKB: 100,
      docType: 'PAYSLIP'
    });
    expect(upperRes.status).toBe(201);
    expect(upperRes.body.status).toBe('ACCEPTED');

    // 2. Mixed case Jpg
    const mixedRes = await request('POST', '/api/documents', {
      fileName: 'mixed_test.jpg',
      mimeType: 'Jpg',
      sizeKB: 100,
      docType: 'PAYSLIP'
    });
    expect(mixedRes.status).toBe(201);
    expect(mixedRes.body.status).toBe('ACCEPTED');
  });
});
