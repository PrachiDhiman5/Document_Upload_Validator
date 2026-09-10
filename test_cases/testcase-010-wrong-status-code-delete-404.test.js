const { startTestServer, request } = require('./helpers');

describe('Test Case 010 — DELETE /api/documents/:id (wrong-status-code on non-existent ID)', () => {
  startTestServer();

  test('should return HTTP 404 when deleting a document ID that does not exist', async () => {
    const notFoundRes = await request('DELETE', '/api/documents/9999');
    expect(notFoundRes.status).toBe(404);
  });
});
