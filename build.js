// Rigenera i componenti condivisi e adatta i percorsi per GitHub Pages.
const fs = require('node:fs');
const {entries, renderPage} = require('./components/layout.cjs');

const basePath = '/heppenstall-sito';

function addHtmlBasePath(html) {
  return html.replace(/(\b(?:href|src|action)\s*=\s*["'])\/(?!\/|heppenstall-sito(?:\/|["']))/gi, `$1${basePath}/`);
}

function addCssBasePath(css) {
  return css.replace(/(url\(\s*["']?)\/(?!\/|heppenstall-sito(?:\/|["']))/gi, `$1${basePath}/`);
}

function replaceArrowIcons(html) {
  return html
    .replaceAll('↗', '<svg class="icon-arrow" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 17 17 7M8 7h9v9"/></svg>')
    .replaceAll('↓', '<svg class="icon-arrow" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 5v14m-7-7 7 7 7-7"/></svg>');
}

function build() {
  // Valida tutte le pagine prima di aggiornare i file del branch di pubblicazione.
  const pages = entries.map(({file}) => {
    const original = fs.readFileSync(file, 'utf8');
    const rendered = addHtmlBasePath(renderPage(original, file));
    return {file, html: replaceArrowIcons(rendered)};
  });
  const stylesheet = `${__dirname}/style.css`;
  const originalCss = fs.readFileSync(stylesheet, 'utf8');
  const css = addCssBasePath(originalCss);

  let updated = 0;
  for (const {file, html} of pages) {
    if (fs.readFileSync(file, 'utf8') !== html) {
      fs.writeFileSync(file, html);
      updated++;
    }
  }
  if (originalCss !== css) {
    fs.writeFileSync(stylesheet, css);
  }

  console.log(`GitHub Pages: aggiornate ${updated} pagine${originalCss !== css ? ' e style.css' : ''}.`);
}

if (require.main === module) build();

module.exports = {build};
