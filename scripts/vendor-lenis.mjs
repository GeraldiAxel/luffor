/* Keep the published static site independent of runtime CDN requests. */
import {mkdir,copyFile,readFile} from 'node:fs/promises';
const packageRoot=new URL('../node_modules/lenis/',import.meta.url);
const out=new URL('../dist/assets/vendor/',import.meta.url);
const pkg=JSON.parse(await readFile(new URL('package.json',packageRoot),'utf8'));
if(pkg.version!=='1.3.27')throw new Error('Expected the pinned Lenis 1.3.27 package.');
await mkdir(out,{recursive:true});
for(const name of ['lenis.min.js','lenis.min.js.map','lenis.css'])await copyFile(new URL('dist/'+name,packageRoot),new URL(name,out));
await copyFile(new URL('LICENSE',packageRoot),new URL('LENIS-LICENSE.txt',out));
console.log('Bundled Lenis '+pkg.version+' and its MIT license.');
