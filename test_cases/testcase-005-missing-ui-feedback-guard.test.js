const fs = require('fs');
const path = require('path');

describe('Test Case 005 — UI (missing-ui-feedback-guard)', () => {
  test('UI upload form submit handler should not unconditionally display success toast on rejection', () => {
    const appJs = fs.readFileSync(path.resolve(__dirname, '../public/app.js'), 'utf-8');
    
    // The submit listener must inspect res.ok or data.status before showing success toast
    const unconditionallyShowsSuccess = appJs.includes('showToast("Document uploaded successfully!", "success")') &&
                                       !appJs.includes('res.ok') &&
                                       !appJs.includes('status === 201') &&
                                       !appJs.includes('data.status === "ACCEPTED"');
    
    expect(unconditionallyShowsSuccess).toBe(false);
  });
});
