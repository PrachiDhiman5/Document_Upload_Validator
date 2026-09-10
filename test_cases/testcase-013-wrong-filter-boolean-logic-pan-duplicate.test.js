const { startTestServer, request } = require('./helpers');

describe('Test Case 013 — POST /api/documents (wrong-filter-boolean-logic identity check)', () => {
  startTestServer();

  test('should reject duplicate PAN document submissions even when fileName is different', async () => {
    // Seed has PAN document (id: 1, fileName: "pan_card.pdf").
    // Submitting a new PAN with a different fileName ("another_pan.pdf") must be rejected.
    const dupPanRes = await request('POST', '/api/documents', {
      fileName: 'another_pan.pdf',
      mimeType: 'pdf',
      sizeKB: 100,
      docType: 'PAN'
    });
    expect(dupPanRes.status).toBe(400);
    expect(dupPanRes.body.status).not.toBe('ACCEPTED');
  });
});
