import {mkdir,readFile,copyFile} from 'node:fs/promises';
const source=new URL('../node_modules/three/',import.meta.url),out=new URL('../dist/assets/vendor/',import.meta.url);
const pkg=JSON.parse(await readFile(new URL('package.json',source),'utf8'));
if(pkg.version!=='0.160.0')throw new Error('Expected Three.js 0.160.0.');
await mkdir(out,{recursive:true});
await copyFile(new URL('build/three.module.min.js',source),new URL('three.module.js',out));
await copyFile(new URL('LICENSE',source),new URL('THREE-LICENSE.txt',out));
console.log('Bundled Three.js '+pkg.version+' and its MIT license.');
