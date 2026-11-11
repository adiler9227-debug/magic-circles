// Сборка v4: берёт чистый index.html из git (ветка graphics-v2, коммит 74f5fe4), ставит новых героев (heroes4.js),
// точечные правки умений и модуль эффектов (fx3.js). Можно запускать сколько угодно раз.
// Запуск: node build/apply-fx3.js
const fs=require('fs'),path=require('path'),vm=require('vm'),cp=require('child_process');
const root=path.join(__dirname,'..'),fp=path.join(root,'index.html');
let h=cp.execSync('git show 74f5fe43e0e5002aef8b08408a1b456aa6055592:index.html',{cwd:root,maxBuffer:64*1024*1024}).toString('utf8');
const rd=n=>fs.readFileSync(path.join(__dirname,n),'utf8').trim().replace(/\r\n/g,'\n');
const R=(a,b,name)=>{const n=h.split(a).length-1;if(n!==1)throw new Error('якорь «'+(name||a.slice(0,50))+'» найден '+n+' раз');h=h.replace(a,()=>b)};

// --- 1. новые модели мага и мечника (заменяют makeArchmage и makeSaint целиком) ---
{const a=h.indexOf('// ---------- Великий архимаг'),b=h.indexOf('const _hzv=new THREE.Vector3();');if(a<0||b<0||b<a)throw new Error('якоря героев не найдены');h=h.slice(0,a)+rd('heroes4.js')+'\n'+h.slice(b)}

// --- 2. доступ к шейдеру итоговой картинки ---
R('window.PFX={draw,size};','window.PFX={draw,size,comp:mComp};');

// --- 3. Мировой разрез: разлом на земле идёт точно по красной линии (был повёрнут на 90°) ---
R('{line:1,L:650,w:44,ang}','{line:1,L:650,w:30,ang:ang-Math.PI/2}','разлом');

// --- 4. АТОМНЫЙ: без дыма ---
R("wrap(4,6,'atomic',()=>{const{o,O}=ctx()","wrap(4,6,'atomic',()=>{window.FX3ND=performance.now()+17000;const{o,O}=ctx()",'atomic старт');
R('UFX.burst(O.x,O.z,110,110,70,1.8,5.5);UFX.dustRing(O.x,O.z,80,120,30,0x4a3a5a,5,3)}','UFX.burst(O.x,O.z,110,110,70,1.8,5.5)}','atomic пыль');
R('if(q<3.5&&(mush+=dt)>.06){mush=0;UFX.column(O.x,O.z,4,55,24,q<.8?0x7a6290:0x443650,5.5,8);if(q>.8){const a=rnd()*P2,r=10+rnd()*25;UFX.puff(O.x+Math.cos(a)*r*.3,70+rnd()*20,O.z+Math.sin(a)*r*.3,Math.cos(a)*r,2+rnd()*4,Math.sin(a)*r,30+rnd()*14,5,0x5a4868,14,.5,.5)}}','','atomic гриб');

// --- 5. «Цель всей жизни — смерть»: циферблат закреплён за спиной мага, без лишних вращающихся кругов, большие стрелки ---
R('function goal(){const O=CP().position;pL=1;','function goal(){const O=CP().position,F0=fwd();pL=1;','goal F0');
R('dial=new THREE.Mesh(new THREE.PlaneGeometry(30,30),dm2)','dial=new THREE.Mesh(new THREE.PlaneGeometry(10,10),dm2)','goal размер');
R("const hand=(len,w)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,1,.3).translate(0,.5,0),hm);o.scale.y=len;o.position.z=1.6;m.G.add(o);return o};",'const hand=(len,w)=>FX3.hand(len,w,hm,m.G);','goal стрелка');
R('mh=hand(12.5,.45),hh=hand(8,.8),jw=new THREE.Mesh(new THREE.SphereGeometry(.9,10,8),hm)','mh=hand(4.4,.22),hh=hand(2.9,.32),jw=new THREE.Mesh(new THREE.SphereGeometry(.26,10,8),hm)','goal стрелки');
R('G.set(O.x+F.x*34,11,O.z+F.z*34);m.G.rotation.y=Math.atan2(F.x,F.z)+Math.PI;','G.set(O.x-F0.x*2.5,5.6,O.z-F0.z*2.5);m.G.rotation.y=Math.atan2(F0.x,F0.z)+Math.PI;','goal место');
R('dial.rotation.z=(1-ea)*3;','','goal вращение');
R('m.set(t,fade(t,4.5,TE,TE+.7));','m.set(t,0);','goal круги');
R('cs=Math.cos(a)*15;emit(G.x+ax.x*cs,G.y+Math.sin(a)*15,','cs=Math.cos(a)*5.1;emit(G.x+ax.x*cs,G.y+Math.sin(a)*5.1,','goal искры');

// --- 6. акула: нёбо и верхние зубы лежат по нижней линии морды (раньше висели отдельно под носом) ---
R('{const NZ=14,NR=12,po=[],pi=[],po2=[];','{const BY=(x,z)=>{const u=Math.max(0,(.5-z)/.9),hh=Math.max(.004,u<.3?.085*Math.pow(u/.3,.5):.085),w=hh*.82;return -hh*.82*Math.sqrt(Math.max(.15,1-(x/w)*(x/w)))};const NZ=14,NR=12,po=[],pi=[],po2=[];','акула BY');
R('g.scale(.058,1,.09);g.translate(0,-.05,.36);add(g,3)}','g.scale(.048,1,.09);g.translate(0,-.05,.36);{const a=g.attributes.position;for(let i=0;i<a.count;i++)a.setY(i,BY(a.getX(i),a.getZ(i))-.003)}add(g,3)}','акула нёбо');
R('tooth(q*w,-.045,z,0,1.15-u*.3,0)','tooth(q*w*.8,BY(q*w*.8,z)+.001,z,0,1.15-u*.3,0)','акула зубы');

// --- 6б. Шинра Тенсей: музыка включается через 4 секунды после активации (была на 13-й секунде, почти в конце) ---
R('if(!m2&&t>=13){m2=1;','if(!m2&&t>=4){m2=1;','шинра музыка');

// --- 7. модуль эффектов ---
{const re=/\r?\nloop\(\);\s*<\/script>\s*<\/body>\s*<\/html>/g,n=(h.match(re)||[]).length;if(n!==1)throw new Error('якорь loop() найден '+n+' раз');h=h.replace(re,m=>'\n'+rd('fx3.js')+'\n'+m)}

// проверка синтаксиса главного скрипта
const s0=h.lastIndexOf('<script>'),s1=h.lastIndexOf('</script>');new vm.Script(h.slice(s0+8,s1),{filename:'index.html#main'});
fs.writeFileSync(fp,h);console.log('OK: собрано, размер index.html',(h.length/1e6).toFixed(2),'МБ');
