import {readFile, readdir, stat} from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root = fileURLToPath(new URL('../dist/', import.meta.url));
const files = await readdir(root,{recursive:true});
let checked = 0;
for (const file of files) {
  if (!(await stat(path.join(root,file))).isFile()) continue;
  if (/\.(html|css|js)$/.test(file)) {
    const source = await readFile(path.join(root,file),'utf8');
    if (file.endsWith('.js') && !/[/\\]vendor[/\\]/.test(file)) new vm.Script(source,{filename:file});
    for (const match of source.matchAll(/(?:src=["']|href=["']|url\(['"]?)(assets\/[^"'\s)]+)/g)) {
      await stat(path.join(root,match[1])); checked++;
    }
  }
}
const window = {};
vm.runInNewContext(await readFile(path.join(root,'site-data.js'),'utf8'),{window});
if (!window.PORTFOLIO.brand.name || !window.PORTFOLIO.contact.email) throw new Error('Brand and enquiry details are required.');
const html = await readFile(path.join(root,'index.html'),'utf8');
const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
for (const match of html.matchAll(/href="#([^"]+)"/g)) {
  if (!ids.has(match[1]) && !match[1].startsWith('social-')) throw new Error(`Missing link target: ${match[1]}`);
}
console.log(`Ready: ${files.length} files, ${checked} local asset references, valid navigation and JavaScript.`);
