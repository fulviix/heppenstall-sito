const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {entries, renderPage} = require('../components/layout.cjs');
const root = path.resolve(__dirname, '..');

for (const {page, lang, file} of entries) {
  test(`${page.key} / ${lang}: layout, lingua e contenuto`, () => {
    const original = fs.readFileSync(file, 'utf8');
    const result = renderPage(original, file);
    const main = html => html.match(/<main\b[\s\S]*?<\/main>/)[0];
    assert.equal(main(result), main(original));
    assert.equal(result.match(/<head>[\s\S]*?<\/head>/)[0], original.match(/<head>[\s\S]*?<\/head>/)[0]);
    assert.equal(renderPage(result, file), result, 'Rendering must be idempotent');
    const header = result.match(/<header>[\s\S]*?<\/header>/)[0];
    const footer = result.match(/<footer>[\s\S]*?<\/footer>/)[0];
    const nav = header.split('<div class="language-switch"')[0];
    const inNavigation = page.key !== 'home' && page.navigation !== false;
    assert.equal((nav.match(/aria-current="page"/g)||[]).length, inNavigation ? 1 : 0);
    if (inNavigation) assert(nav.includes(`href="${page[lang]}" aria-current="page"`));
    const switcher = header.match(/<div class="language-switch"[\s\S]*?<\/div>/)[0];
    assert.equal((switcher.match(/aria-current="page"/g)||[]).length, 1);
    assert(switcher.includes(`aria-label="${lang === 'it' ? 'Italiano' : 'English'}" aria-current="page"`));
    assert.equal(switcher.includes('aria-disabled="true"'), !page.en);
    assert(footer.includes(lang === 'it' ? 'P. IVA' : 'VAT'));
    for (const social of ['LinkedIn','Instagram','Facebook']) assert(footer.includes(`aria-label="${social}"`));
    assert(footer.includes('https://fulviodipietro.it/'));
    for (const match of (header+footer).matchAll(/(?:href|src)="(\/[^"#]*)"/g)) assert(fs.existsSync(path.join(root, match[1])), match[1]);
    assert(!result.includes('{{'));
  });
}
