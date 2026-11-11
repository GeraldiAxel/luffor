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
// The cockpit ships a real glTF asset, matching local loaders, and a fallback.
if (html.includes('cockpit.js')) {
  for (const file of ['cockpit.js','cockpit.css','assets/cockpit-poster.png','assets/vendor/GLTFLoader.js','assets/vendor/BufferGeometryUtils.js']) await stat(path.join(root,file));
  const model=await readFile(path.join(root,'assets/luffor-wheelhouse.glb'));
  if(model.readUInt32LE(0)!==0x46546c67||model.readUInt32LE(4)!==2||model.readUInt32LE(8)!==model.length) throw new Error('Invalid wheelhouse GLB container.');
  const gltf=JSON.parse(model.subarray(20,20+model.readUInt32LE(12)).toString());
  if(gltf.meshes.length>64||model.length>8*1024*1024) throw new Error('Wheelhouse exceeds its geometry/transfer budget; merge static geometry before export.');
  if(!gltf.nodes.some(node=>node.name==='RadarScreen')) throw new Error('Wheelhouse navigation display is missing.');
  if(html.includes('ship-layout.js')) {
    const layoutContext={window:{}};
    vm.runInNewContext(await readFile(path.join(root,'ship-layout.js'),'utf8'),layoutContext);
    const ship=layoutContext.window.LUFFOR_SHIP;
    if(ship.crew.length!==3||ship.crew.filter(p=>p.gender==='man').length!==2||ship.crew.filter(p=>p.gender==='woman').length!==1) throw new Error('Ship crew must contain two men and one woman.');
    for(const person of ship.crew) if(!gltf.nodes.some(n=>n.name.includes(`Dev${person.id}_black hair`))) throw new Error(`Developer ${person.id} is missing from the exported ship.`);
    for(const [name,view] of Object.entries(ship.views)) for(const key of ['position','target','mobilePosition','mobileTarget']) if(view[key].length!==3||!view[key].every(Number.isFinite)) throw new Error(`Invalid ${name} camera ${key}.`);
    if(ship.scale&&(!ship.scale.every(n=>Number.isFinite(n)&&n>0)||ship.scale.length!==3)) throw new Error('Ship proportions must be three positive scale values.');
    for(const view of Object.values(ship.views)) for(const key of ['midPosition','midTarget']) if(view[key]&&(view[key].length!==3||!view[key].every(Number.isFinite))) throw new Error('Invalid tall-desktop camera.');
    const climb=ship.stairPath.slice(1); // The first point is the approach before the stair foot.
    if(ship.views.upper.position[1]<5||climb.some((p,i,points)=>i&&p[1]<points[i-1][1])) throw new Error('Upper-deck navigation must climb the authored stairs.');
    if((await stat(path.join(root,'assets/ship-blockout.glb'))).size>512*1024) throw new Error('Architectural entrance must remain a lightweight asset.');
    console.log('Cruise ship: 3 black-haired developers, finite camera stops, ascending staircase, lightweight 3D entrance.');
  }
  for(const file of ['assets/vendor/GLTFLoader.js','assets/vendor/BufferGeometryUtils.js']) {
    if((await readFile(path.join(root,file),'utf8')).includes("from 'three'")) throw new Error('The local GLTF loader must not use an unresolved package import.');
  }
  console.log(`Wheelhouse: ${(model.length/1024/1024).toFixed(2)} MiB, ${gltf.meshes.length} meshes, valid GLB and local loaders.`);
}
// The cockpit studio hero: Blender-exported scene, line model, lightmaps, manifest and poster.
if (html.includes('cockpit-studio.js')) {
  const dir='assets/cockpit-studio/';
  const manifest=JSON.parse(await readFile(path.join(root,dir,'scene_manifest.json'),'utf8'));
  const readGlb=async name=>{
    const model=await readFile(path.join(root,dir,name));
    if(model.readUInt32LE(0)!==0x46546c67||model.readUInt32LE(4)!==2||model.readUInt32LE(8)!==model.length) throw new Error(`Invalid GLB container: ${name}`);
    return {model,gltf:JSON.parse(model.subarray(20,20+model.readUInt32LE(12)).toString())};
  };
  const {model,gltf}=await readGlb(manifest.files.scene);
  await readGlb(manifest.files.wireframe);
  if(gltf.meshes.length>64||model.length>6*1024*1024) throw new Error('Cockpit studio exceeds its geometry/transfer budget.');
  const names=new Set(gltf.nodes.map(node=>node.name));
  for(const camera of manifest.cameras){
    if(!names.has(camera.name)) throw new Error(`Camera ${camera.name} is missing from the exported scene.`);
    if(camera.position.length!==3||camera.quaternion.length!==4||![...camera.position,...camera.quaternion].every(Number.isFinite)) throw new Error(`Invalid camera pose: ${camera.name}`);
  }
  const hotspotNames=new Set(manifest.hotspots.map(h=>h.name)),cameraNames=new Set(manifest.cameras.map(c=>c.name));
  for(const d of manifest.destinations){
    if(!cameraNames.has(d.camera)||!hotspotNames.has(d.hotspot)) throw new Error(`Destination ${d.id} points at a missing camera or hotspot.`);
    if(!html.includes(`data-cockpit-go="${d.id}"`)) throw new Error(`Destination ${d.id} has no control in the page.`);
  }
  for(const clip of manifest.animations) if(!gltf.animations.some(a=>a.name===clip.name)) throw new Error(`Animation clip ${clip.name} is missing.`);
  if(gltf.skins.length!==3) throw new Error('The cockpit crew must contain three rigged developers.');
  for(const beam of manifest.realtime_lights.keep) if(!names.has(beam)) throw new Error(`Lighthouse light ${beam} is missing.`);
  const script=await readFile(path.join(root,'cockpit-studio.js'),'utf8');
  const ext=(script.match(/lightmapExt:\s*'([^']*)'/)||[])[1]||'.png';
  for(const file of manifest.files.lightmaps) await stat(path.join(root,dir,'lightmaps',file.replace(/\.png$/,ext)));
  for(const object of Object.keys(manifest.lightmaps.objects)) if(!names.has(object)) throw new Error(`Lightmapped object ${object} is missing.`);
  await stat(path.join(root,dir,'poster.webp'));
  for(const file of ['assets/vendor/GLTFLoader.js','assets/vendor/BufferGeometryUtils.js']) {
    if((await readFile(path.join(root,file),'utf8')).includes("from 'three'")) throw new Error('The local GLTF loader must not use an unresolved package import.');
  }
  console.log(`Cockpit studio: ${(model.length/1024/1024).toFixed(2)} MiB, ${gltf.meshes.length} meshes, ${manifest.cameras.length} cameras, ${manifest.destinations.length} destinations, ${gltf.skins.length} developers.`);
}
const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
for (const match of html.matchAll(/href="#([^"]+)"/g)) {
  if (!ids.has(match[1]) && !match[1].startsWith('social-')) throw new Error(`Missing link target: ${match[1]}`);
}
console.log(`Ready: ${files.length} files, ${checked} local asset references, valid navigation and JavaScript.`);
