// Rigenera i componenti condivisi negli HTML, pronti per hosting statico.
const fs = require('node:fs');
const {entries, renderPage} = require('./components/layout.cjs');
let updated = 0;
// Valida tutte le pagine prima di scrivere.
const results = entries.map(({file}) => {
  const original = fs.readFileSync(file, 'utf8');
  return {file, original, rendered: renderPage(original, file)};
});
for (const {file, original, rendered} of results) {
  if (original !== rendered) {
    fs.writeFileSync(file, rendered);
    updated++;
  }
}
console.log(`Componenti aggiornati: ${updated} pagine su ${entries.length}.`);
