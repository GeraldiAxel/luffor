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
    if (file.endsWith('.js')) new vm.Script(source,{filename:file});
    for (const match of source.matchAll(/(?:src=["']|href=["']|url\(['"]?)(assets\/[^"'\s)]+)/g)) {
      await stat(path.join(root,match[1])); checked++;
    }
  }
}
const window = {};
vm.runInNewContext(await readFile(path.join(root,'site-data.js'),'utf8'),{window});
if (window.PORTFOLIO.projects.length !== 4) throw new Error('Four projects are required.');
for (const project of window.PORTFOLIO.projects) {
  for (const field of ['slug','title','category','year','image','overview','role','challenge','approach','outcome','support']) if (!project[field]) throw new Error(`Missing ${field}`);
  await stat(path.join(root,project.image)); await stat(path.join(root,project.support));
}
console.log(`Ready: ${files.length} files, ${checked} local asset references, four complete case-study structures, valid JavaScript.`);
