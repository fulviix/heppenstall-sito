// Server locale senza dipendenze. Avvio: node server.js
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { renderPage } = require('./components/layout.cjs');
const root = __dirname;
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ttf': 'font/ttf',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const filename = path.resolve(root, '.' + decodeURIComponent(url.pathname));
    if (filename !== root && !filename.startsWith(root + path.sep)) {
      res.writeHead(403); res.end('Accesso negato'); return;
    }
    let target = filename;
    const stat = await fs.stat(target);
    if (stat.isDirectory()) {
      if (!url.pathname.endsWith('/')) {
        res.writeHead(301, { Location: url.pathname + '/' + url.search });
        res.end(); return;
      }
      target = path.join(target, 'index.html');
    }
    let data = await fs.readFile(target);
    if (path.extname(target) === '.html') {
      data = renderPage(data.toString('utf8'), target);
    }
    res.writeHead(200, {
      'Content-Type': types[path.extname(target)] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    res.end(data);
  } catch (error) {
    res.writeHead(error.code === 'ENOENT' ? 404 : 400);
    res.end(error.code === 'ENOENT' ? 'Pagina non trovata' : 'Richiesta non valida');
  }
});
server.on('error', error => {
  console.error('Impossibile avviare il server:', error.message);
  process.exitCode = 1;
});
server.listen(3000, '127.0.0.1', () => {
  console.log('Sito disponibile: http://localhost:3000');
  console.log('Modifica i file e aggiorna il browser. Ctrl+C per fermare.');
});
