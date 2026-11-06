import {readFile,writeFile} from 'node:fs/promises';
const out=new URL('../dist/assets/',import.meta.url),N='#02204f',I='#f9f5eb';
const names=['forme','quiet-edit','common-ground','perspective'];
const titles=['Forme.','The Quiet Edit.','Common Ground.','Perspective.'];
const headings=[['Company','websites.'],['Content','platforms.'],['Custom','applications.'],['Clearer','dashboards.']];
for(let i=0;i<4;i++){
 const dark=i%2===0,bg=dark?N:I,ink=dark?I:N;
 const data=(await readFile(new URL('project-'+names[i]+'.svg',out))).toString('base64');
 const type=(x,y,size,value,extra='')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${ink}" font-family="Georgia,serif" ${extra}>${value}</text>`;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900"><rect width="600" height="900" fill="${bg}"/><g font-family="monospace" font-size="10" letter-spacing="1.8" fill="${ink}"><text x="38" y="50">LUFFOR / DIGITAL EXPLORATIONS</text><text x="38" y="852">INDEPENDENT CONCEPT</text><text x="520" y="852">0${i+1}</text></g><path d="M38 80h524M38 808h524" stroke="${ink}" opacity=".3"/>${type(35,171,65,headings[i][0])}${type(35,241,65,headings[i][1],'font-style="italic"')}<image x="20" y="293" width="560" height="350" href="data:image/svg+xml;base64,${data}"/>${type(35,752,i===2?59:66,titles[i],'letter-spacing="-3"')}</svg>`;
 await writeFile(new URL('cover-'+names[i]+'.svg',out),svg);
}
console.log('Four digital concept covers created.');
