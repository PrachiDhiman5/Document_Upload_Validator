const fs = require('fs');
const path = require('path');

describe('Test Case 006 — UI (wrong-format-display size in MB)', () => {
  test('UI documents table should render file size in KB matching input unit, not MB', () => {
    const appJs = fs.readFileSync(path.resolve(__dirname, '../public/app.js'), 'utf-8');
    
    // Should display ${d.sizeKB} KB and must NOT display MB
    expect(appJs).not.toMatch(/<td>\${d\.sizeKB}\s*MB<\/td>/i);
    expect(appJs).toMatch(/<td>\${d\.sizeKB}\s*KB<\/td>/i);
  });
});
