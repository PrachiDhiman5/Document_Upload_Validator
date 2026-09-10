const fs = require('fs');
const path = require('path');

describe('Test Case 011 — UI (wrong-status-badge-color)', () => {
  test('UI app.js should map ACCEPTED status to accepted class and REJECTED to rejected class', () => {
    const appJs = fs.readFileSync(path.resolve(__dirname, '../public/app.js'), 'utf-8');
    
    // Must NOT invert the CSS class mapping
    expect(appJs).not.toContain('const badgeClass = d.status === "ACCEPTED" ? "rejected" : "accepted"');
    expect(appJs).toMatch(/d\.status\s*===\s*["']ACCEPTED["']\s*\?\s*["']accepted["']\s*:\s*["']rejected["']/);
  });
});
