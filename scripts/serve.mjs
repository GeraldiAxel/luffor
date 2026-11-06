import http from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root = fileURLToPath(new URL('../dist/', import.meta.url));
const port = Number(process.env.PORT || 4173);
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8'};
const server = http.createServer(async (req,res) => {
  try {
    let requested = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if (requested.endsWith('/')) requested += 'index.html';
    const target = path.resolve(root, '.' + requested);
    if (!target.startsWith(root)) { res.writeHead(403).end('Forbidden'); return; }
    const info = await stat(target);
    if (!info.isFile()) throw new Error('Not a file');
    const body = await readFile(target);
    res.writeHead(200, {'Content-Type':types[path.extname(target)] || 'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
    res.end(body);
  } catch { res.writeHead(404,{'Content-Type':'text/plain'}).end('Not found'); }
});
server.listen(port,'127.0.0.1',()=>console.log(`Luffor portfolio ready: http://localhost:${port}`));
process.on('SIGINT',()=>server.close(()=>process.exit(0)));
