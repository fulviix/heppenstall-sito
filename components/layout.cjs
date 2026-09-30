const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

// Aggiungere qui una lingua solo quando la relativa pagina esiste.
const pages = [
  { key: 'home', it: '/', en: '/en/' },
  { key: 'tongs', it: '/steel-tongs/', en: '/en/steel-tongs/' },
  { key: 'handling', it: '/handling-technology/', en: '/en/handling-technology/' },
  { key: 'service', it: '/service-revamping/' },
  { key: 'research', it: '/research-development/' },
  { key: 'company', it: '/who-we-are/' },
  { key: 'contacts', it: '/contacts/' },
  { key: 'privacy', it: '/privacy-policy/', navigation: false }
];
const labels = {
  it: { tongs: 'Pinze di sollevamento', handling: 'Movimentazione', service: 'Service', research: 'R&D', company: 'Azienda', contacts: 'Parliamo del tuo progetto', language: 'Lingua', vat: 'P. IVA' },
  en: { tongs: 'Steel tongs', handling: 'Handling technology', service: 'Service', research: 'R&D', company: 'Company', contacts: 'Let’s talk about your project', language: 'Language', vat: 'VAT' }
};
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const entries = pages.flatMap(page => ['it', 'en'].filter(lang => page[lang]).map(lang => ({page, lang, file: path.join(root, page[lang].slice(1), 'index.html')})));

function template(name, values) {
  return fs.readFileSync(path.join(__dirname, name + '.html'), 'utf8').trim().replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!(key in values)) throw new Error('Unknown template variable: ' + key);
    return values[key];
  });
}

function renderPage(html, file) {
  const entry = entries.find(item => item.file === path.resolve(file));
  if (!entry) return html;
  const {page, lang} = entry;
  const words = labels[lang];
  const icons = path.relative(path.dirname(path.resolve(file)), path.join(root, 'assets/icons.svg')).split(path.sep).join('/');
  const home = pages[0][lang];
  const navigation = pages.filter(item => item.key !== 'home' && item.navigation !== false).map(item => {
    const contact = item.key === 'contacts';
    return `<a${contact ? ' class="nav-contact"' : ''} href="${item[lang] || item.it}"${item.key === page.key ? ' aria-current="page"' : ''}>${escape(words[item.key])}${contact ? ' <span><svg class="icon-arrow" width="24" height="24" aria-hidden="true" focusable="false"><use href="/assets/icons.svg#arrow-up-right"></use></svg></span>' : ''}</a>`;
  }).join('\n    ');
  const languages = ['it', 'en'].map(code => {
    const name = code === 'it' ? 'Italiano' : 'English';
    if (!page[code]) return '<span lang="en" aria-disabled="true" aria-label="English: traduzione non ancora disponibile" title="Traduzione inglese non ancora disponibile">EN</span>';
    return `<a href="${page[code]}" lang="${code}" hreflang="${code}" aria-label="${name}"${code === lang ? ' aria-current="page"' : ''}>${code.toUpperCase()}</a>`;
  }).join('\n      ');
  const components = {
    header: template('header', {home, navigation, languages, languageLabel: words.language}),
    footer: template('footer', {home, vat: words.vat})
  };
  for (const [tag, content] of Object.entries(components)) {
    const pattern = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, 'g');
    if ([...html.matchAll(pattern)].length !== 1) throw new Error(`Expected one ${tag} in ${file}`);
    html = html.replace(pattern, () => content.replaceAll('/assets/icons.svg', icons));
  }
  return html;
}
module.exports = {entries, renderPage};
