// Сборка v4: берёт чистый index.html из git (ветка graphics-v2, коммит 66b07f4), ставит новых героев (heroes4.js),
// точечные правки умений и модуль эффектов (fx3.js). Можно запускать сколько угодно раз.
// Запуск: node build/apply-fx3.js
const fs=require('fs'),path=require('path'),vm=require('vm'),cp=require('child_process');
const root=path.join(__dirname,'..'),fp=path.join(root,'index.html');
let h=cp.execSync('git show 66b07f4:index.html',{cwd:root,maxBuffer:64*1024*1024}).toString('utf8');
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

// --- 6в. ульты: у остальных игроков нет заморозки, чужая камера и фильтр экрана не трогаются ---
R('BLK.setFrz(WT.stop);ME.hold=Math.max(ME.hold||0,WT.stop);','BLK.setFrz(WT.stop);if(o===ME)ME.hold=Math.max(ME.hold||0,WT.stop);','разрез hold');
R('BLK.setFrz(T0);ME.hold=Math.max(ME.hold||0,T0);if(o===ME)ME.hold=TE;','BLK.setFrz(T0);if(o===ME)ME.hold=TE;','шинра hold');
R('const wcFil=f=>{try{','const wcFil=f=>{if(f&&CTX&&CTX.o&&CTX.o!==ME)return;try{','фильтр');
R('window.FOGK=Math.max(1,C.z*.9);','if(mine)window.FOGK=Math.max(1,C.z*.9);','туман акулы');
// АТОМНЫЙ: камера, заморозка и фильтр экрана только у того, кто его применил
{const a=h.indexOf('function atomic(){'),e=h.indexOf('CAM.z=1;CAM.y=0;CAM.sh=0;FRZ=0;',a);if(a<0||e<0)throw new Error('atomic не найден');let t=h.slice(a,e+31);const n0=t.length;
 t=t.replace(/mine=o===ME;\s*FRZ=T3_\+\.15;ME\.hold=Math\.max\(ME\.hold\|\|0,T3_\+\.15\);if\(mine\)ME\.hold=T3_\+1;/,'mine=o===ME,CM=mine?CAM:{z:1,y:0,sh:0};if(mine){FRZ=T3_+.15;ME.hold=T3_+1}');if(t.length===n0)throw new Error('atomic шапка');
 t=t.split('CAM.').join('CM.').replace('CM=mine?CM:','CM=mine?CAM:').split('cfil(').join('(mine?cfil:()=>{})(').replace('FRZ=Math.max(0,FRZ-dt);','if(mine)FRZ=Math.max(0,FRZ-dt);').replace('CM.sh=0;FRZ=0;','CM.sh=0;if(mine)FRZ=0;');h=h.slice(0,a)+t+h.slice(e+31)}
// --- 6г. Мировой разрез: молния идёт по цепочке через всех персонажей на карте ---
R('left=cand.slice();while(left.length&&chain.length<1){','left=cand.some(c=>c.p)?cand.filter(c=>c.p):cand.slice();const CHN=Math.max(1,left.filter(c=>c.p).length);while(left.length&&chain.length<CHN){','разрез цепь');
R('cand.push({x:q.g.position.x,z:q.g.position.z});','cand.push({x:q.g.position.x,z:q.g.position.z,p:1});','разлом игроки');
R('let tg=null,bd=1e9;cand.forEach(','let tg=null,bd=1e9;(cand.some(c=>c.p)?cand.filter(c=>c.p):cand).forEach(','разлом цель');

// --- 6д. Шинра Тенсей: дальность волны x2; подключение модуля VFX ---
R('fall:1.6,R:390,','fall:1.6,R:780,','шинра радиус');
R('<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>','<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>\n<script src="vfx/vfx.js"></script>\n<script src="vfx/skins.js"></script>','vfx скрипты');

// --- 6е. «Фиолетовый» Блочного воина: сначала синяя сфера, потом красная; новые сферы и вспышка слияния ---
R('const PT={red:.5,blue:7.9,','const PT={red:7.9,blue:.5,','порядок сфер');
R('const b=orb(0x2a8cff,0x1050ff,3),r=orb(0xff2a2a,0xff0040,3);','const b=FX3.gorb(0,3),r=FX3.gorb(1,3);','сферы');
R('P=orb(0xa040ff,0x7a20ff,9.2);','P=FX3.gorb(2,9.2);FX3.merge(X,Y,Z);','слияние');

// --- 6ж. «Синий» и «Красный» (отдельные умения): новые сферы; красный бьёт всех, кого отталкивает ---
R('const ob=orb(c1,c2,2.2);let t=0,tk=0,X=0,Z=0,a0=0,st=0;','const ob=FX3.gorb(red?1:0,2.2);let t=0,tk=0,X=0,Z=0,a0=0,st=0;','сферы синий/красный');
R('ex[i]+=dx/d*sp;ez[i]+=dz/d*sp}\n     const od=','ex[i]+=dx/d*sp;ez[i]+=dz/d*sp}if(tick&&d<24)eH(i,dm_*.4);\n     const od=','красный урон');
R('if(tick)plT(q=>Math.hypot(q.x-X,q.z-Z)<8,.5,X,Z,.4);return true}','if(tick)plT(q=>Math.hypot(q.x-X,q.z-Z)<8||(red&&Math.hypot(q.x-p.x,q.z-p.z)<24),.5,red?p.x:X,red?p.z:Z,.4);return true}','красный урон игрокам');

// --- 6з. DOOM: вступление (вспышка пространства, молнии), дыра появляется на 0.6 с и резко растёт, она больше, область шире; ударная волна с уроном — когда дыра схлопнулась ---
R('T.y=15;sHole();','T.y=15;sHole();try{FX3.doomIn(T.x,T.y,T.z)}catch(e){}','doom вступление');
R('AT.r=75;AT.s=26;AT.k=6;','AT.r=100;AT.s=30;AT.k=9;','doom область');
R('if(qd<75&&qd>2){const sp=Math.min(qd-2,16*dt*(1+(1-qd/75)*1.5))','if(qd<100&&qd>2){const sp=Math.min(qd-2,16*dt*(1+(1-qd/100)*1.5))','doom притяжение игроков');
R('H.g.scale.setScalar(Math.max(.01,t<5?Math.min(t/1.2,1)*7+Math.sin(t*3)*.3:Math.max(0,7*(1-(t-5)/.5))));','{const g0=Math.min(1,Math.max(0,(t-.6)/.28));H.g.scale.setScalar(Math.max(.01,t<5?g0*(10+2.5*Math.sin(g0*Math.PI))+Math.sin(t*3)*.3:Math.max(0,10*(1-(t-5)/.4))))}','doom размер');
R('else if(!x){x=1;AT.on=0;sBoom(2);sThunder();shake(3);flash(1);lite(T.x,T.y,T.z,0xff2030,4);shock(T.x,T.z,0xc01020,90,1.4);shock(T.x,T.z,0x500008,70,1.8);curtain(T.x,T.z,30,60,0x8a0010,2);scorch(T.x,T.z,38,38,0,0xa01020,0x050002,6.5);killIn(T.x,T.z,48)}','else if(t>=5.4&&!x){x=1;AT.on=0;sBoom(2);sThunder();shake(3);flash(1);lite(T.x,T.y,T.z,0xff2030,4);shock(T.x,T.z,0xff3040,125,1.1);shock(T.x,T.z,0xc01020,110,1.5);shock(T.x,T.z,0x500008,85,1.9);curtain(T.x,T.z,36,60,0x8a0010,2);scorch(T.x,T.z,46,46,0,0xa01020,0x050002,6.5);killIn(T.x,T.z,65)}','doom волна');

// --- 6и. Аметистовый клинок: урон по игрокам меньше (было 1.2 от базового, с двух ударов убивал) ---
R('stn(i,.4)}});plT(q=>hit(q.x,q.z),1.2,p.x,p.z);','stn(i,.4)}});plT(q=>hit(q.x,q.z),.5,p.x,p.z);','клинок урон');
// --- 6к. Теневые кунаи: 13 клинков вместо 9, разброс шире, у каждого своя модель ---
R('for(let k=-4;k<=4;k++){const a=y0+k*.115,dx=Math.sin(a),dz=Math.cos(a);let x=p.x+dx*2,z=p.z+dz*2,tr=0;','for(let k=-6;k<=6;k++){const a=y0+k*.13,dx=Math.sin(a),dz=Math.cos(a),km=FX3.kunai(a);let x=p.x+dx*2,z=p.z+dz*2,tr=0;','кунаи разброс');
R('fx.push(dt=>{const st=85*dt,n=Math.ceil(st/2),h=st/n;','fx.push(dt=>{km.position.set(x,2.2,z);km.rotation.z+=dt*20;const st=85*dt,n=Math.ceil(st/2),h=st/n;','кунаи модель');
R('if(hit){if(tr<=55){killIn(x,z,2.4);','if(hit){if(tr<=55){FX3.star(x,2.2,z,0xc080ff,11,.2);killIn(x,z,2.4);','кунаи вспышка');
R('0xc080ff,1.3,-10)}return false}}return true})}}','0xc080ff,1.3,-10)}return false}}return true},()=>FX3.kunaiEnd(km))}}','кунаи конец');

// --- 6л. DOOM: пока затягивает — урон по игроку ~1% здоровья 4 раза в секунду; после схлопывания — волна ---
R('p.x+=qx/qd*sp;p.z+=qz/qd*sp}}','p.x+=qx/qd*sp;p.z+=qz/qd*sp}H.dk=(H.dk||0)+dt;if(qd<100&&H.dk>.25){H.dk=0;pHurt(ME,ME.maxhp*.0099,O4)}}','doom урон затягивания');
R('else if(t>=5.4&&!x){x=1;AT.on=0;','else if(t>=5.4&&!x){x=1;AT.on=0;try{FX3.doomOut(T.x,T.y,T.z)}catch(e){}','doom волна-пузырь');
// --- 6м. Мировой разрез: метки и линии следуют за целями до самого удара (шаг в сторону не спасает), полоса шире ---
R("\n for(const q of players)if(q!==o&&q.dead<=0&&q.g.visible&&!coopM)cand.push({x:q.g.position.x,z:q.g.position.z,p:1});","\n for(const q of players)if(q!==o&&q.dead<=0&&q.g.visible&&!coopM)cand.push({x:q.g.position.x,z:q.g.position.z,p:1,q});",'разрез ссылка на игрока');
R("if(t<WT.stop){const q=t/WT.stop;wcFil(","if(t<WT.stop){chain.forEach(c=>{if(c.q&&c.q.dead<=0){c.x=c.q.g.position.x;c.z=c.q.g.position.z}});marks.forEach(m=>m.r.position.set(m.c.x,.3,m.c.z));const q=t/WT.stop;wcFil(",'разрез слежение');
R("if(!cut){cut=1;wcFil('');","if(!cut){cut=1;{let pv2=O;lines.forEach((ln,i)=>{const c=chain[i];if(c.q&&c.q.dead<=0){c.x=c.q.g.position.x;c.z=c.q.g.position.z}const dx=c.x-pv2.x,dz=c.z-pv2.z,l=Math.hypot(dx,dz);if(l>=3){ln.D.x=dx/l;ln.D.z=dz/l}ln.P.x=(c.x+pv2.x)/2;ln.P.z=(c.z+pv2.z)/2;const an=Math.atan2(ln.D.x,ln.D.z);[ln.sheet,ln.glow,ln.glow2,ln.crack,ln.edge].forEach(m=>{m.position.x=ln.P.x;m.position.z=ln.P.z;m.rotation.y=an});pv2=c})}wcFil('');",'разрез наводка');
R("else fKill(i)}});plT(q=>lines.some(ln=>onLine(ln,q.x,q.z,6)),8,O.x,O.z,.01);","else fKill(i)}});plT(q=>lines.some(ln=>onLine(ln,q.x,q.z,13)),8,O.x,O.z,.01);",'разрез ширина по игрокам');
R("ln.sheet.scale.set(.4,160*e,L);","ln.sheet.scale.set(1.4,160*e,L);",'разрез лист');
R("ln.glow.scale.set(4+q*6,160*e,L);","ln.glow.scale.set(13+q*8,160*e,L);",'разрез свечение');
R("ln.glow2.scale.set(14+q*10,40,L);","ln.glow2.scale.set(28+q*10,40,L);",'разрез свечение 2');
R("ln.crack.scale.set(1.4+q*2.5,.1,L);","ln.crack.scale.set(5+q*3,.1,L);",'разрез трещина');
R("ln.edge.scale.set(2.6+q*3.5,.11,L);","ln.edge.scale.set(8+q*4,.11,L);",'разрез кромка');
// --- 6н. урон: маг x1.75 по игрокам (35 из 100 за умение), Расенсюрикен 0.45, три расенгана ниндзя -15% ---
R("o.cl===2?1:o.cl===3?.5:1)","o.cl===2?(i===0?.45:i<4?.85:1):o.cl===3?.5:o.cl===0?1.75:1)",'урон классов');
// --- 6о. «Цель всей жизни — смерть»: забирает здоровье до 1% от максимума (блокируется куполом и стеной как обычно) ---
R("dm=true;if(CTX)CTX.dmg=GOAL_DMG+DMG_PER_LVL*(CTX.o.lvl||0);","dm=true;if(CTX){CTX.dmg=GOAL_DMG+DMG_PER_LVL*(CTX.o.lvl||0);CTX.g99=1}",'цель 99%');
{const a="CTX.hit.add(q);pHurt(q,CTX.dmg,CTX.o,x,z)}}}",n=h.split(a).length-1;if(n<1)throw new Error('якорь «цель 99% урон» не найден');h=h.split(a).join("CTX.hit.add(q);pHurt(q,CTX.g99?Math.max(0,q.hp-q.maxhp*.01):CTX.dmg,CTX.o,x,z)}}}")}
// --- 6п. откаты ниндзя: Расенсюрикен +4 с, три расенгана +2 с ---
R("cdm:[15,1.4,1,.16,3,8,6,12,0,6,5.2]","cdm:[19,1.4,1,.16,3,8,6,12,0,6,5.2]",'откат расенсюрикена');
R("'Расенган',3,1.2],[2,'🌕','Одама Расенган',9,2.2],[3,'🪐','Планетарный Расенган',16,4.3]","'Расенган',5,1.2],[2,'🌕','Одама Расенган',11,2.2],[3,'🪐','Планетарный Расенган',18,4.3]",'откат расенганов');

// --- 6ш. ШЕСТОЙ ГЕРОЙ «Предок» (класс 5): модель makeAncestor (heroes4.js) + умения (ancestor.js) ---
R('// ===== НОВЫЕ ТЕХНИКИ: Ниндзя',rd('ancestor.js')+'\n// ===== НОВЫЕ ТЕХНИКИ: Ниндзя','предок: умения');
R('const BLKM=BLK.model();','const BLKM=BLK.model(),ANCM=makeAncestor();','предок: модель');
R('<button id="cb" class="chip">🧱 Блочный воин</button>','<button id="cb" class="chip">🧱 Блочный воин</button><button id="ca" class="chip">👊 Предок</button>','предок: кнопка');
R('E — блок-купол<br>Золотые','E — блок-купол<br>👊 Предок: 1–9 — удары, 7 или R — ульта «Джаджанкен» (раз в 3 мин), 6 — корни, 8 — молот, Q — стена, E — купол<br>Золотые','предок: справка');
R("document.getElementById('cb')];","document.getElementById('cb'),document.getElementById('ca')];",'предок: cN');
R('mage=c==4?BLKM:','mage=c==5?ANCM:c==4?BLKM:','предок: setClass');
R("document.body.classList.toggle('cls4',c===4);","document.body.classList.toggle('cls4',c===4);document.body.classList.toggle('cls5',c===5);",'предок: cls5');
R('D.cm=c==4?BLK.model():','D.cm=c==5?makeAncestor():c==4?BLK.model():','предок: setDUCls');
R('cN[4].onclick=()=>setClass(4);','cN[4].onclick=()=>setClass(4);cN[5].onclick=()=>setClass(5);','предок: клик');
R('const CCOL=[0xc080ff,0xffd060,0x66ddff,0xff5ad8,0xa040ff];','const CCOL=[0xc080ff,0xffd060,0x66ddff,0xff5ad8,0xa040ff,0x3ddc84];','предок: цвет');
R('const ULTS=[6,7,8,7,6]','const ULTS=[6,7,8,7,6,6]','предок: ульта');
R("'🧱 Блочный воин'],box=","'🧱 Блочный воин','👊 Предок'],box=",'предок: лобби');
R("if(e.code==='KeyR'&&cls===4)cast(6);","if(e.code==='KeyR'&&(cls===4||cls===5))cast(6);",'предок: R');

R("if(cls===3&&e.button===0&&e.target===R.domElement&&!isTouch)cast(0)","if(cls===3&&e.button===0&&e.target===R.domElement&&!isTouch)cast(0);if(cls===5&&e.button===0&&e.target===R.domElement&&!isTouch)cast(0)",'предок: ЛКМ');
// --- 7. модуль эффектов ---
{const re=/\r?\nloop\(\);\s*<\/script>\s*<\/body>\s*<\/html>/g,n=(h.match(re)||[]).length;if(n!==1)throw new Error('якорь loop() найден '+n+' раз');h=h.replace(re,m=>'\n'+rd('fx3.js')+'\n'+m)}

// проверка синтаксиса главного скрипта
const s0=h.lastIndexOf('<script>'),s1=h.lastIndexOf('</script>');new vm.Script(h.slice(s0+8,s1),{filename:'index.html#main'});
fs.writeFileSync(fp,h);console.log('OK: собрано, размер index.html',(h.length/1e6).toFixed(2),'МБ');
