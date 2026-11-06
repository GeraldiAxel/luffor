/* Editable, deterministic concept compositions. Replace the resulting SVGs with
   real project images of the same aspect ratios when personalising the portfolio. */
import {writeFile, mkdir} from 'node:fs/promises';
const out = new URL('../dist/assets/', import.meta.url);
await mkdir(out,{recursive:true});
const navy = '#02204f', ivory = '#f9f5eb', deep = '#011733';
const serif = 'Georgia, Times New Roman, serif', sans = 'Arial, Helvetica, sans-serif', mono = 'Courier New, monospace';
const svg = (w,h,body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><filter id="paper"><feTurbulence type="fractalNoise" baseFrequency=".65" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".035"/></feComponentTransfer><feBlend in="SourceGraphic" mode="multiply"/></filter><filter id="shadow" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="8" dy="20" stdDeviation="20" flood-color="${deep}" flood-opacity=".13"/></filter></defs>${body}</svg>`;
const text = (x,y,size,content,opts='') => `<text x="${x}" y="${y}" font-size="${size}" ${opts.includes('fill=')?'':`fill="${navy}"`} ${opts.includes('font-family=')?'':`font-family="${sans}"`} ${opts}>${content}</text>`;
const orbit = (cx,cy,r,count,color=ivory) => Array.from({length:count},(_,i)=>`<ellipse cx="${cx}" cy="${cy}" rx="${r-i*5}" ry="${r*.95-i*4.75}" transform="rotate(${i*5} ${cx} ${cy})" fill="none" stroke="${color}" stroke-width=".7" opacity="${.35+i/count*.6}"/>`).join('');
const lines = (x,y,width,count,color=navy,gap=13) => Array.from({length:count},(_,i)=>`<path d="M${x} ${y+i*gap}h${width-(i===count-1?width*.3:0)}" stroke="${color}" stroke-width="2" opacity=".35"/>`).join('');

await writeFile(new URL('project-forme.svg',out),svg(1600,950,`
<path fill="${ivory}" d="M0 0h1600v950H0z"/><path fill="${navy}" opacity=".035" d="M0 0h1600v950H0z"/>
<g filter="url(#shadow)" transform="rotate(8 1060 450)"><rect x="773" y="100" width="553" height="730" fill="${deep}"/><rect x="781" y="95" width="553" height="730" fill="${navy}"/><path d="M793 95v730" stroke="${ivory}" opacity=".15"/>
${orbit(1057,380,172,28)}${text(828,166,13,'FORM, FEELING &amp; POSSIBILITY',`fill="${ivory}" letter-spacing="2"`)}
${text(826,744,93,'forme',`fill="${ivory}" font-family="${serif}" letter-spacing="-5"`)}${text(1243,741,12,'01',`fill="${ivory}" font-family="${mono}"`)}</g>
<g filter="url(#shadow)" transform="rotate(-9 510 520)"><rect x="206" y="279" width="575" height="397" fill="${ivory}"/>
${text(252,354,20,'forme',`font-family="${serif}" letter-spacing="-1"`)}
${text(250,443,49,'The shape of',`font-family="${serif}" letter-spacing="-2"`)}${text(250,501,49,'possibility.',`font-family="${serif}" font-style="italic" letter-spacing="-2"`)}
<path d="M251 580h483" stroke="${navy}" stroke-width=".7" opacity=".35"/>${text(251,618,9,'A CONSIDERED IDENTITY',`letter-spacing="1.6"`)}${text(664,618,9,'NO. 001',`font-family="${mono}"`)}</g>
${text(57,68,10,'FORME / AN IDENTITY EXPLORATION',`font-family="${mono}" letter-spacing="1.5" opacity=".5"`)}<path d="M1510 852v40m-20-20h40" stroke="${navy}" opacity=".3"/>`));

await writeFile(new URL('project-quiet-edit.svg',out),svg(1000,1100,`
<path fill="${deep}" d="M0 0h1000v1100H0z"/><path fill="${navy}" d="M0 0h1000v1100H0z" opacity=".45"/>
<g transform="rotate(-7 500 550)" filter="url(#shadow)"><rect x="175" y="116" width="655" height="880" fill="${ivory}"/><rect x="175" y="116" width="9" height="880" fill="${navy}" opacity=".18"/>
${text(221,172,10,'AN EXPLORATION OF THE ESSENTIAL',`letter-spacing="1.5"`)}${text(742,172,10,'VOL. 01',`font-family="${mono}"`)}
<path d="M220 199h560" stroke="${navy}" stroke-width="1"/>
${text(213,344,141,'The',`font-family="${serif}" letter-spacing="-8"`)}${text(213,485,141,'quiet',`font-family="${serif}" font-style="italic" letter-spacing="-8"`)}${text(213,626,141,'edit.',`font-family="${serif}" letter-spacing="-8"`)}
<path d="M489 686h290v215H489z" fill="${navy}"/>
${Array.from({length:22},(_,i)=>`<path d="M${510+i*12} 881 Q${540+i*4} ${745+i*2} ${758-i*7} 706" fill="none" stroke="${ivory}" opacity=".5" stroke-width=".8"/>`).join('')}
${text(221,739,11,'LESS, BUT',`letter-spacing="1"`)}${text(221,760,11,'WITH MEANING.',`letter-spacing="1"`)}${lines(221,800,174,5,navy,12)}
<path d="M220 929h560" stroke="${navy}" stroke-width=".6"/>${text(221,957,9,'A JOURNAL OF CONSIDERED DESIGN',`letter-spacing="1.3"`)}${text(748,957,9,'001',`font-family="${mono}"`)}</g>`));

await writeFile(new URL('project-common-ground.svg',out),svg(900,1100,`
<path fill="${ivory}" d="M0 0h900v1100H0z"/><path fill="${navy}" opacity=".09" d="M0 0h900v1100H0z"/>
<g filter="url(#shadow)"><rect x="98" y="104" width="704" height="886" fill="${ivory}"/><rect x="98" y="104" width="704" height="29" fill="${navy}"/>
<g fill="${ivory}" opacity=".55"><circle cx="117" cy="118" r="3"/><circle cx="130" cy="118" r="3"/><circle cx="143" cy="118" r="3"/></g>
${text(128,182,14,'common ground',`letter-spacing="-.7"`)}${text(652,182,7,'ABOUT    JOURNAL',`letter-spacing="1.2"`)}<path d="M128 207h642" stroke="${navy}" opacity=".3"/>
${text(132,259,7,'SPACES FOR SHARED PERSPECTIVES',`font-family="${mono}" letter-spacing="1.1"`)}
${text(126,342,65,'Room for',`font-family="${serif}" letter-spacing="-2"`)}${text(126,413,65,'a different view.',`font-family="${serif}" font-style="italic" letter-spacing="-3"`)}
<path d="M131 463h133" stroke="${navy}" stroke-width=".6"/>${text(132,452,8,'EXPLORE THE POSSIBILITIES  ↗',`letter-spacing=".3"`)}
<rect x="131" y="498" width="638" height="335" fill="${navy}"/><path d="M294 833V672a157 157 0 0 1 314 0v161" fill="${ivory}"/>
<path d="M319 833V674a132 132 0 0 1 264 0v159" fill="${navy}"/><path d="M343 833V675a108 108 0 0 1 216 0v158" fill="${ivory}"/>
<path d="M368 833V678a83 83 0 0 1 166 0v155" fill="${navy}"/><path d="M391 833V679a60 60 0 0 1 120 0v154" fill="${ivory}"/>
<path d="M131 860h638" stroke="${navy}" opacity=".3"/>${text(132,892,8,'A SHARED POINT OF VIEW',`letter-spacing="1"`)}${lines(132,918,235,3,navy,10)}${lines(510,892,259,5,navy,10)}
${text(132,969,6,'DIGITAL CONCEPT / 003',`font-family="${mono}" letter-spacing="1"`)}</g>`));

await writeFile(new URL('project-perspective.svg',out),svg(1600,800,`
<path fill="${ivory}" d="M0 0h1600v800H0z"/><path fill="${navy}" opacity=".035" d="M0 0h1600v800H0z"/>
<path d="M55 55h1490v690H55z" fill="none" stroke="${navy}" stroke-width=".7" opacity=".5"/>
${text(80,92,10,'A STUDY IN FORM &amp; POSSIBILITY',`font-family="${mono}" letter-spacing="1.6"`)}${text(1388,92,10,'NO. 004',`font-family="${mono}" letter-spacing="1"`)}
<g transform="translate(530 126)"><path d="M0 435V230a230 230 0 0 1 460 0v205z" fill="${navy}"/>
<path d="M54 435V230a176 176 0 0 1 352 0v205z" fill="${ivory}"/><path d="M108 435V230a122 122 0 0 1 244 0v205z" fill="${navy}"/>
<path d="M162 435V230a68 68 0 0 1 136 0v205z" fill="${ivory}"/>
<path d="M-92 435h644" stroke="${navy}" stroke-width=".8"/>${Array.from({length:12},(_,i)=>`<path d="M${-90+i*28} 435l${-190+i*14} 132" stroke="${navy}" opacity=".2" stroke-width=".8"/>`).join('')}</g>
${text(80,691,152,'Perspective',`font-family="${serif}" letter-spacing="-8"`)}${text(1235,650,11,'SAME WORLD.',`letter-spacing="1.8"`)}${text(1235,676,11,'DIFFERENT VIEW.',`letter-spacing="1.8"`)}
<path d="M1402 334v81m-41-40h81" stroke="${navy}" stroke-width=".7" opacity=".5"/>`));

await writeFile(new URL('detail-forme.svg',out),svg(1600,800,`
<path fill="${ivory}" d="M0 0h1600v800H0z"/><rect x="80" y="80" width="700" height="640" fill="${navy}"/>${orbit(430,340,190,32)}${text(133,661,70,'forme',`fill="${ivory}" font-family="${serif}" letter-spacing="-4"`)}
${text(875,190,10,'01 / THE VISUAL LANGUAGE',`font-family="${mono}" letter-spacing="1.5"`)}${text(865,334,111,'Aa Bb Cc',`font-family="${serif}" letter-spacing="-4"`)}${text(875,401,20,'CLARITY. CHARACTER. CARE.',`letter-spacing="2"`)}<path d="M875 459h560" stroke="${navy}" opacity=".3"/>
<rect x="875" y="510" width="180" height="105" fill="${navy}"/><rect x="1065" y="510" width="180" height="105" fill="${ivory}" stroke="${navy}" stroke-width=".5"/><rect x="1255" y="510" width="180" height="105" fill="${deep}"/>${text(875,650,9,'A REPLACEABLE IDENTITY STUDY',`font-family="${mono}" letter-spacing="1.2"`)}`));

await writeFile(new URL('detail-quiet-edit.svg',out),svg(1600,800,`
<path fill="${deep}" d="M0 0h1600v800H0z"/><g transform="translate(150 100) rotate(-2 650 300)"><rect width="1300" height="600" fill="${ivory}"/><path d="M650 0v600" stroke="${navy}" opacity=".25"/>
${text(54,65,9,'THE QUIET EDIT',`letter-spacing="1.5"`)}${text(52,190,75,'The art of',`font-family="${serif}" letter-spacing="-3"`)}${text(52,275,75,'paying attention.',`font-family="${serif}" font-style="italic" letter-spacing="-3"`)}${lines(55,340,240,12,navy,12)}${lines(335,340,240,12,navy,12)}
<rect x="700" y="45" width="549" height="455" fill="${navy}"/>${orbit(976,272,195,34)}${text(700,540,12,'A LITTLE SPACE TO SEE THINGS DIFFERENTLY.',`letter-spacing="1"`)}${text(53,567,8,'006',`font-family="${mono}"`)}${text(1225,567,8,'007',`font-family="${mono}"`)}</g>`));

await writeFile(new URL('detail-common-ground.svg',out),svg(1600,800,`
<path fill="${ivory}" d="M0 0h1600v800H0z"/><path fill="${navy}" opacity=".06" d="M0 0h1600v800H0z"/>
<g transform="translate(120 115)"><rect width="985" height="570" fill="${ivory}"/><path d="M0 0h985v25H0z" fill="${navy}"/>${text(35,80,19,'common ground',`letter-spacing="-1"`)}<path d="M35 105h915" stroke="${navy}" opacity=".2"/>
${text(35,190,58,'A shared',`font-family="${serif}" letter-spacing="-2"`)}${text(35,252,58,'point of view.',`font-family="${serif}" font-style="italic" letter-spacing="-2"`)}${lines(38,305,280,5,navy,12)}
<path d="M515 143h435v385H515z" fill="${navy}"/><path d="M596 528V341a138 138 0 0 1 276 0v187z" fill="${ivory}"/><path d="M630 528V343a104 104 0 0 1 208 0v185z" fill="${navy}"/><path d="M664 528V345a70 70 0 0 1 140 0v183z" fill="${ivory}"/>
${text(38,521,10,'SPACE FOR SOMETHING NEW.  ↗',`letter-spacing="1"`)}</g>
<g transform="translate(1148 194)"><rect width="266" height="491" rx="20" fill="${navy}"/><rect x="8" y="9" width="250" height="474" rx="14" fill="${ivory}"/>${text(26,52,13,'common ground',`letter-spacing="-.8"`)}<path d="M25 72h214" stroke="${navy}" opacity=".3"/>${text(23,126,29,'Room for',`font-family="${serif}" letter-spacing="-1"`)}${text(23,159,29,'a different view.',`font-family="${serif}" font-style="italic" letter-spacing="-1"`)}<rect x="25" y="195" width="216" height="230" fill="${navy}"/><path d="M59 425V305a74 74 0 0 1 148 0v120z" fill="${ivory}"/><path d="M81 425V307a52 52 0 0 1 104 0v118z" fill="${navy}"/><path d="M103 425V309a30 30 0 0 1 60 0v116z" fill="${ivory}"/>${text(25,456,6,'EXPLORE THE POSSIBILITIES  ↗',`letter-spacing="1"`)}</g>`));

await writeFile(new URL('detail-perspective.svg',out),svg(1600,800,`
<path fill="${deep}" d="M0 0h1600v800H0z"/>${[0,1,2].map((i)=>`<g transform="translate(${95+i*480} 90)"><rect width="450" height="620" fill="${ivory}"/>${text(26,48,8,`PERSPECTIVE / 00${i+1}`,`font-family="${mono}" letter-spacing="1"`)}<g transform="translate(65 125)">${i===0?`<path d="M0 285V150a160 160 0 0 1 320 0v135z" fill="${navy}"/><path d="M45 285V150a115 115 0 0 1 230 0v135z" fill="${ivory}"/><path d="M90 285V150a70 70 0 0 1 140 0v135z" fill="${navy}"/>`:i===1?`${orbit(160,150,155,30,navy)}`:`<path d="M0 285L160 0l160 285z" fill="${navy}"/><path d="M60 285L160 105l100 180z" fill="${ivory}"/><path d="M120 285l40-74 40 74z" fill="${navy}"/>`}</g>${text(26,535,44,['Form.','Feeling.','Possibility.'][i],`font-family="${serif}" font-style="italic" letter-spacing="-2"`)}<path d="M27 566h396" stroke="${navy}" opacity=".3"/>${text(27,592,7,'A DIFFERENT WAY OF SEEING',`letter-spacing="1.4"`)}</g>`).join('')}`));
console.log('Created eight editable SVG concept compositions.');
