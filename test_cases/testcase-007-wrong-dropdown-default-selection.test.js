const fs = require('fs');
const path = require('path');

describe('Test Case 007 — UI (wrong-dropdown-default-selection)', () => {
  test('UI Mime Type dropdown must not force a default selection (PNG) on initial load', () => {
    const html = fs.readFileSync(path.resolve(__dirname, '../public/index.html'), 'utf-8');
    
    // First option must be a placeholder forcing explicit selection, not "PNG"
    const firstMimeOption = html.match(/<select id="mimeType">[\s\S]*?<option[^>]*>([\s\S]*?)<\/option>/i);
    expect(firstMimeOption).not.toBeNull();
    const firstOptionText = firstMimeOption[1].trim();
    expect(firstOptionText).not.toBe('PNG');
  });
});
