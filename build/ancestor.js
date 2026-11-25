// ===== 6-Й ГЕРОЙ «ПРЕДОК» (класс 5): умения. Вставляется сборкой перед «НОВЫЕ ТЕХНИКИ: Ниндзя» =====
// Умения вызываются без аргументов (кастер — CS()), урон — от CTX.dmg. Ульта — индекс 6, откат 180 с.
// Камера не трясётся: «дрожь земли» — трещины, прыгающие камни и пыль. Слои ульт — из общей библиотеки UFX и FX3.
const ANC=(function(){
const T3=THREE,V3=T3.Vector3,PI=Math.PI,{glm,eH,eUp,forE,stn,plT,kv,MO,face,isB,sBoomB}=BLK.H;
const CL=v=>Math.max(-292,Math.min(292,v));                                   // не дальше края карты 600×600
const gm=(c,o)=>{const m=glm(c,o);m.side=2;return m};                        // свечение, видно с обеих сторон
const sm=(c,o,e)=>new T3.MeshLambertMaterial({color:c,emissive:e||0,transparent:true,opacity:o==null?1:o});
const dk=(c,o)=>new T3.MeshBasicMaterial({color:c,transparent:true,opacity:o==null?1:o,depthWrite:false,side:2});
const shg=g=>{g.userData.sh=1;return g};
const SPH=shg(new T3.SphereGeometry(1,20,14)),RNG=shg(new T3.RingGeometry(.82,1,48)),
 HEMI=shg(new T3.SphereGeometry(1,40,18,0,PI*2,0,PI/2)),CRES=shg(new T3.RingGeometry(.86,1,24,1,0,PI*.75));
const K=n=>UFX.K(n),now=()=>performance.now()/1000;
// эффект-объект: живёт life сек, после — убирается и чистится (общие геометрии не трогаем)
function fxo(o,life,fn,d){let t=-(d||0);o.visible=false;S.add(o);
 fx.push(dt=>{t+=dt;if(t<0)return true;o.visible=true;const k=t/life;if(k>=1)return false;fn(k,dt,t);return true},
  ()=>{S.remove(o);o.traverse(m=>{if(m.material){if(m.material.map&&m.material.map.userData&&m.material.map.userData.own)m.material.map.dispose();m.material.dispose()}if(m.geometry&&!m.geometry.userData.sh)m.geometry.dispose()})})}
const later=(d,fn)=>{let t=0;fx.push(dt=>{t+=dt;if(t<d)return true;try{fn()}catch(e){console.error('anc',e)}return false})};
// ---------- урон (позже момента каста — с сохранённым CTX кастера) ----------
const withC=(c,fn)=>{if(!c)return;const s=CTX;CTX={o:c.o,dmg:c.dmg,hit:new Set()};try{fn()}finally{CTX=s}};
function area(c,x,z,r,mul,op){if(!c)return;const d=c.dmg*mul;
 forE((i,qx,qz)=>{if(Math.hypot(qx-x,qz-z)<r+(isB(i)?5:0)){eH(i,d);if(op&&op.st)stn(i,op.st);if(op&&op.up&&!isB(i))eUp(i,x,z,op.up)}});
 withC(c,()=>plT(q=>Math.hypot(q.x-x,q.z-z)<r,mul,x,z))}
const segD=(px,pz,a,b)=>{const abx=b.x-a.x,abz=b.z-a.z,t=Math.max(0,Math.min(1,((px-a.x)*abx+(pz-a.z)*abz)/(abx*abx+abz*abz||1)));return Math.hypot(px-a.x-abx*t,pz-a.z-abz*t)};
function line(c,a,b,w,mul){if(!c)return;const d=c.dmg*mul;forE((i,qx,qz)=>{if(segD(qx,qz,a,b)<w+(isB(i)?5:0))eH(i,d)});withC(c,()=>plT(q=>segD(q.x,q.z,a,b)<w,mul,a.x,a.z))}
const cx=()=>{const c=CTX,o=CS(),p=CP().position.clone(),F=fwd();face(o,F);return{c,o,p,F,v:kv(o)}};
const heavy=o=>{const m=MO(o);if(m&&m.play)m.play('cast_heavy')};

// ---------- текстура «струй» для воронок (огонь, ветер, аура) ----------
const STR=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.globalCompositeOperation='lighter';
 for(let i=0;i<70;i++){const sx=Math.random()*256,w=2+Math.random()*9,h=60+Math.random()*190,sy=Math.random()*256,g=x.createLinearGradient(0,sy,0,sy+h);
  g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,'rgba(255,255,255,'+(.25+Math.random()*.5)+')');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;
  for(const dx of[-256,0,256]){x.save();x.translate(sx+dx,0);x.transform(1,0,-.35,1,0,0);x.fillRect(-w/2,sy,w,h);x.restore()}}
 const f=x.getImageData(0,0,256,256);for(let y=0;y<256;y++){const a=Math.sin(y/255*PI);for(let q=0;q<256;q++)f.data[(y*256+q)*4+3]*=a}x.putImageData(f,0,0);
 const t=new T3.CanvasTexture(c);t.wrapS=t.wrapT=T3.RepeatWrapping;return t})();
// воронка: открытый конус с бегущими струями (вращается и течёт вверх)
function funnel(x,z,rTop,rBot,H,col,life,o){o=o||{};const tx=STR.clone();tx.needsUpdate=true;tx.userData={own:1};tx.repeat.set(o.rep||3,1);
 const m=new T3.Mesh(new T3.CylinderGeometry(rTop,rBot,H,40,1,true).translate(0,H/2,0),new T3.MeshBasicMaterial({map:tx,color:col,transparent:true,opacity:0,blending:AB,depthWrite:false,side:2}));
 m.position.set(x,o.y||0,z);const sp=o.spin||1.2,up=o.up||.8,peak=o.a||.9;
 fxo(m,life,(k,dt)=>{tx.offset.x+=dt*sp;tx.offset.y-=dt*up;const a=Math.min(1,k*6,(1-k)*4)*peak;m.material.opacity=a;if(o.grow)m.scale.set(.6+k*.6,.7+k*.5,.6+k*.6);if(o.fn)o.fn(k,dt,m)},o.d);return m}
// ---------- толстые молнии: чёрная сердцевина + цветное свечение (видны с любой стороны) ----------
function ribG(pts,w){const n=pts.length,pos=new Float32Array(n*12),idx=[],up=new V3(0,1,0),d=new V3(),s=new V3(),u=new V3();
 for(let i=0;i<n;i++){d.subVectors(pts[Math.min(n-1,i+1)],pts[Math.max(0,i-1)]).normalize();s.crossVectors(d,up);if(s.lengthSq()<1e-4)s.set(1,0,0);s.normalize();u.crossVectors(d,s).normalize();
  const ww=w*(i===0||i===n-1?.3:1),p=pts[i],b=i*12;
  pos.set([p.x+s.x*ww,p.y+s.y*ww,p.z+s.z*ww,p.x-s.x*ww,p.y-s.y*ww,p.z-s.z*ww,p.x+u.x*ww,p.y+u.y*ww,p.z+u.z*ww,p.x-u.x*ww,p.y-u.y*ww,p.z-u.z*ww],b);
  if(i<n-1){const a=i*4,c=a+4;idx.push(a,a+1,c+1,a,c+1,c, a+2,a+3,c+3,a+2,c+3,c+2)}}
 const g=new T3.BufferGeometry();g.setAttribute('position',new T3.BufferAttribute(pos,3));g.setIndex(idx);return g}
function zig(a,b,n,j,gr){const p=[];for(let i=0;i<=n;i++){const u=i/n,q=a.clone().lerp(b,u);if(i&&i<n){q.x+=(rnd()-.5)*j*2;q.y+=(rnd()-.5)*j*(gr?.3:2);q.z+=(rnd()-.5)*j*2;if(gr)q.y=Math.max(.3,q.y)}p.push(q)}return p}
function hbolt(a,b,glow,w,life,o){o=o||{};const pts=zig(a,b,o.n||10,o.j||Math.max(.8,a.distanceTo(b)*.09),o.gr),G=new T3.Group();
 const cm=dk(o.core==null?0x0a0000:o.core,.95),gl=gm(glow,.75),c1=new T3.Mesh(ribG(pts,w),cm),g1=new T3.Mesh(ribG(pts,w*3.2),gl);c1.renderOrder=6;g1.renderOrder=5;G.add(g1,c1);
 if(o.br)for(let k=0;k<o.br;k++){const i=1+Math.floor(rnd()*(pts.length-2)),s=pts[i],e=s.clone().add(new V3((rnd()-.5)*o.br*3,(rnd()-.5)*(o.gr?0:6),(rnd()-.5)*o.br*3));if(o.gr)e.y=.4;
  const bp=zig(s,e,5,.8,o.gr);G.add(new T3.Mesh(ribG(bp,w*.5),gl),new T3.Mesh(ribG(bp,w*.2),cm))}
 fxo(G,life,k=>{const f=(1-k)*(rnd()<.25?.4:1);cm.opacity=.95*f;gl.opacity=.75*f})}
// ---------- надпись техники (как «I AM ATOMIC») ----------
let capE=null,capT=0;
function caption(txt,col){if(!capE){capE=document.createElement('div');capE.style.cssText='position:fixed;left:0;right:0;top:30%;text-align:center;font:900 clamp(30px,8vw,86px) system-ui,sans-serif;letter-spacing:.1em;pointer-events:none;z-index:30;opacity:0;transition:opacity .25s,transform 1.4s ease-out;transform:scale(.8)';document.body.appendChild(capE)}
 clearTimeout(capT);if(!txt){capE.style.opacity=0;capE.style.transform='scale(.8)';return}
 capE.textContent=txt;capE.style.color='#fff6d8';capE.style.textShadow='0 0 16px '+col+',0 0 40px '+col+',0 0 90px '+col;capE.style.opacity=1;capE.style.transform='scale(1.08)'}
const vis=o=>o===ME||kv(o)>.45;
const filt=f=>{try{R.domElement.style.filter=f||''}catch(e){}};
// ---------- взрыв-шар (френель) ----------
function orb(x,y,z,col,r0,r1,life,d){later(d||0,()=>{const s=UFX.shell(x,y,z,col);UFX.run(life,t=>{const k=t/life;s.set(r0+(r1-r0)*(1-Math.pow(1-k,3)),(1-k)*1.6)},()=>s.kill())})}

// 1 · Удар кулаком: короткая ударная волна перед собой
function punch(){const{c,p,F,v}=cx(),x=p.x+F.x*5,z=p.z+F.z*5;
 const r=new T3.Mesh(RNG,gm(0xffffff,.9));r.position.set(x,3,z);r.lookAt(x+F.x,3,z+F.z);fxo(r,.3,k=>{r.scale.setScalar(1.5+k*4.5);r.material.opacity=.9*(1-k)});
 FX3.star(x,3,z,0xffcc66,5,.25);FX3.sparks(x,3,z,10,22,6,0xffaa33,.35);UFX.puff(x,2.5,z,F.x*6,1,F.z*6,3,.6,0x8a7a70,3,.5,1);
 lite(x,3,z,0xffaa33,1.2);sBoomB(.2*v);area(c,x,z,5.5,.9,{st:.25})}

// 2 · Резиновый взрыв: удар — и в точке взрыв (из героя ничего не вылетает)
function rubber(){const{c,p,F,v}=cx(),x=CL(p.x+F.x*16),z=CL(p.z+F.z*16);
 later(.12,()=>{
  FX3.star(x,3,z,0xffffff,12,.3);FX3.star(x,3,z,0xff8833,20,.45);FX3.gflash(x,z,16,0xff7722,.5);
  orb(x,3,z,0xffa040,1,11,.55);
  const w=new T3.Mesh(RNG,gm(0xfff0d0,.95));w.position.set(x,3,z);w.lookAt(x+F.x,3,z+F.z);fxo(w,.35,k=>{w.scale.setScalar(2+k*12);w.material.opacity=.95*(1-k)});
  const g=new T3.Mesh(RNG,gm(0xff8833,.9));g.rotation.x=-PI/2;g.position.set(x,.35,z);fxo(g,.6,k=>{g.scale.setScalar(2+k*16);g.material.opacity=.9*(1-k)});
  const cr=UFX.cracks(x,z,9,0xff7a30);UFX.run(2.2,t=>cr.set(Math.min(1,t*6),Math.max(0,1.2-t*.8),Math.max(0,1-(t-1.4)/.8)),()=>cr.kill());
  UFX.burst(x,z,18,24,18,.7,2.2);UFX.dustRing(x,z,14,18,4,0x8a7064,1.4,1);FX3.sparks(x,3,z,18,30,14,0xffaa33,.5);
  lite(x,4,z,0xff7722,2.5);sBoomB(.7*v);area(c,x,z,10,1.6,{st:.5})})}

// 3 · Красный Ястреб: огненный удар уходит вперёд и раскручивает огненный шторм
function hawk(){const{c,p,F,v}=cx(),tg={x:CL(p.x+F.x*26),z:CL(p.z+F.z*26)};
 // огненная волна по земле до цели
 let t0=0;fx.push(dt=>{t0+=dt;const k=Math.min(1,t0/.28),x=p.x+(tg.x-p.x)*k,z=p.z+(tg.z-p.z)*k;
  for(let n=0;n<3;n++)UFX.puff(x+(rnd()-.5)*2,2+rnd()*2,z+(rnd()-.5)*2,(rnd()-.5)*4,4+rnd()*4,(rnd()-.5)*4,2.6,.5,n?0xff5a10:0xffc040,2.5,3,.8);FX3.star(x,3,z,0xff6a20,4,.12);return k<1});
 later(.28,()=>{const x=tg.x,z=tg.z;
  FX3.star(x,4,z,0xffd080,22,.45);FX3.gflash(x,z,22,0xff5010,.7);orb(x,3,z,0xff5a10,2,14,.6);sBoomB(.8*v);lite(x,6,z,0xff4400,3);
  FX3.seal(x,.14,z,14,0xffd060,2.6,0,3);
  const cr=UFX.cracks(x,z,16,0xff6a10),sh=UFX.shafts(x,z,6,60,0xff6a20,6);
  funnel(x,z,15,3.5,32,0xff5a10,2.6,{spin:2.2,up:1.4,grow:1,rep:4});
  funnel(x,z,9,2.2,26,0xffc040,2.6,{spin:-3,up:1.8,grow:1,rep:3,a:.8});
  let tk=0,em=0;UFX.run(2.6,(t,dt)=>{const k=t/2.6;cr.set(Math.min(1,t*4),1.3-k,Math.max(0,1-(t-2)/.6));sh.set(Math.min(.8,t*3)*(1-k));sh.spin(dt*3);
   if((em+=dt)>.03){em=0;for(let n=0;n<3;n++){const a=t*7+n*2.1+rnd()*.5,h=rnd()*24,r=2.5+h*.45;UFX.puff(x+Math.cos(a)*r,1+h,z+Math.sin(a)*r,-Math.sin(a)*14,6+rnd()*6,Math.cos(a)*14,2.5+h*.12,.7,rnd()<.5?0xff4a10:0xffb030,2,4,.9)}
    FX3.sparks(x,2,z,2,14,26,0xffa030,.7)}
   if((tk+=dt)>.3){tk=0;area(c,x,z,11,.42)}},()=>{cr.kill();sh.kill()});
  area(c,x,z,10,1.3,{st:.5})})}

// 4 · Обезьянья пушка: сжатие → огромный взрыв по области, все улетают
function ape(){const{c,p,F,v}=cx(),x=CL(p.x+F.x*16),z=CL(p.z+F.z*16);heavy(CS());
 const core=new T3.Mesh(SPH,dk(0x120404,.95));core.position.set(x,3,z);fxo(core,.28,k=>core.scale.setScalar(4*(1-k)+.3));
 FX3.star(x,3,z,0xff3010,10,.28);for(let n=0;n<20;n++){const a=rnd()*PI*2,e=(rnd()-.5)*2,r=14;emit(x+Math.cos(a)*r,3+e*4,z+Math.sin(a)*r,-Math.cos(a)*50,-e*14,-Math.sin(a)*50,.28,n&1?0xff6020:0xffffff,1.6,0)}
 area(c,x,z,10,.6);
 later(.28,()=>{FX3.star(x,4,z,0xffffff,30,.4);FX3.star(x,4,z,0xff5020,46,.7);FX3.gflash(x,z,34,0xff4010,.9);flash(.3);
  orb(x,3,z,0xffb070,2,30,.7);orb(x,3,z,0xff3010,1,22,.9,.06);
  for(const[r,cl,d]of[[34,0xffd0a0,0],[26,0xff5020,.08],[18,0xffffff,.16]]){const g=new T3.Mesh(RNG,gm(cl,.95));g.rotation.x=-PI/2;g.position.set(x,.4,z);fxo(g,.7,k=>{g.scale.setScalar(2+k*r);g.material.opacity=.95*(1-k)},d)}
  const cr=UFX.cracks(x,z,32,0xff5a20);UFX.run(3.4,t=>cr.set(Math.min(1,t*5),Math.max(0,1.4-t*.5),Math.max(0,1-(t-2.4))),()=>cr.kill());
  UFX.burst(x,z,55,60,40,.9,3.2);UFX.dustRing(x,z,26,46,7,0x7a6458,2.2,1.5);FX3.sparks(x,3,z,30,46,24,0xffa040,.7);
  lite(x,6,z,0xff5020,3.5);sBoomB(1.1*v);area(c,x,z,28,2.2,{up:2})})}

// 5 · Тацумаки: ветряной смерч с драконом и разрезами, подбрасывает всех вокруг
function tatsu(){const{c,o,p,v}=cx(),x=p.x,z=p.z,L=2.8;
 funnel(x,z,26,6,38,0xe8fff4,L,{spin:2.6,up:1.6,grow:1,rep:6,a:1});funnel(x,z,16,3.5,32,0x55ffaa,L,{spin:-3.4,up:2.2,grow:1,rep:5,a:1});funnel(x,z,8,2.5,26,0xffffff,L,{spin:4.5,up:3,grow:1,rep:4,a:.8});
 FX3.seal(x,.14,z,16,0x66ddff,L,0,3);UFX.dustRing(x,z,22,34,6,0x8aa090,1.8,1);sBoomB(.5*v);lite(x,8,z,0x3ddc84,2.5);
 // ветряной дракон: светящаяся лента-змей летит по спирали вверх (белая сердцевина, зелёное свечение)
 const D=new T3.Group(),cmD=gm(0xffffff,.9),glD=gm(0x3ddc84,.7),c1=new T3.Mesh(new T3.BufferGeometry(),cmD),g1=new T3.Mesh(new T3.BufferGeometry(),glD),hd=new T3.Mesh(SPH,gm(0xe8fff0,.9));D.add(g1,c1,hd);D.position.set(x,0,z);
 const path=u=>{const a=u*7,r=7+Math.sin(u*2.3)*3+u*1.2;return new V3(Math.cos(a)*r,1.5+u*8,Math.sin(a)*r)};
 const rib=(m,pts,w)=>{const old=m.geometry;m.geometry=ribG(pts,w);old.dispose()};
 fxo(D,L,(k,dt,t)=>{const h=t*1.5,pts=[];for(let i=0;i<26;i++)pts.push(path(Math.max(0,h-i*.06)));const f=Math.min(1,(1-k)*4);
  rib(c1,pts,.8);rib(g1,pts,2.6);cmD.opacity=.9*f;glD.opacity=.7*f;hd.position.copy(pts[0]);hd.scale.setScalar(1.9);FX3.star(x+pts[0].x,pts[0].y,z+pts[0].z,0x9affc8,6,.1);hd.material.opacity=.9*f;
  if(rnd()<.6)emit(pts[0].x+x,pts[0].y,pts[0].z+z,(rnd()-.5)*6,(rnd()-.5)*6,(rnd()-.5)*6,.5,rnd()<.5?0xffffff:0x3ddc84,1.4,0)});
 // разрезы-полумесяцы кружат внутри смерча
 for(let i=0;i<12;i++){const m=new T3.Mesh(CRES,gm(i&1?0xffffff:0x9affc8,.9)),r=4+rnd()*14,y=2+rnd()*22,a0=rnd()*PI*2,sp=(rnd()<.5?-1:1)*(4+rnd()*4);m.scale.setScalar(3+rnd()*4);
  fxo(m,.9+rnd()*.8,(k,dt,t)=>{const a=a0+t*sp;m.position.set(x+Math.cos(a)*r,y+t*6,z+Math.sin(a)*r);m.rotation.set(rnd()*.2+1.2,a,t*14);m.material.opacity=.9*Math.sin(k*PI)},rnd()*1.6)}
 area(c,x,z,22,1.4,{up:1.4});let tk=0,em=0;
 UFX.run(L,(t,dt)=>{if((em+=dt)>.04){em=0;for(let n=0;n<2;n++){const a=rnd()*PI*2,r=5+rnd()*18;UFX.puff(x+Math.cos(a)*r,1,z+Math.sin(a)*r,-Math.sin(a)*24,10+rnd()*8,Math.cos(a)*24,3,.8,0x9ab0a0,2,6,.6)}}
  if((tk+=dt)>.45){tk=0;area(c,x,z,22,.3,{up:.6})}})}

// 6 · Дзюкай Котан (полуульта): земля дрожит и трескается, корни ползут по земле вокруг героя — видны только их спины
function jukai(){const{c,o,p,F,v}=cx(),x=p.x,z=p.z,L=5,RR=46;heavy(o);const ab=Math.atan2(-F.z,-F.x),cam=(px,pz)=>(px-x)*F.x+(pz-z)*F.z<2&&Math.hypot(px-x,pz-z)<20;
 const G=new T3.Group(),roots=[];G.position.set(x,0,z);
 const mat=()=>sm(0x4a2e18,1,0x140a02);
 for(let i=0;i<K(26);i++){const an=i/K(26)*PI*2+(rnd()-.5)*.25;let da=Math.abs(((an-ab)%(PI*2)+PI*3)%(PI*2)-PI);if(da<.75)continue;const len=RR*(.7+rnd()*.3),pts=[],th=.75+rnd()*.7,ph=rnd()*9,arch=rnd()<.45?2+Math.floor(rnd()*4):-1;
  for(let s=0;s<=12;s++){const u=s/12,d=3+u*len,wv=Math.sin(u*7+ph)*4*u,y=-th*.45+(s===arch?th*1.8:0)+Math.sin(u*11+ph)*.25;
   pts.push(new V3(Math.cos(an)*d-Math.sin(an)*wv,y,Math.sin(an)*d+Math.cos(an)*wv))}
  const tg=new T3.TubeGeometry(new T3.CatmullRomCurve3(pts),48,th*(1-0)*.9,7,false),m=new T3.Mesh(tg,mat());m.userData.c=new T3.CatmullRomCurve3(pts);m.userData.n=tg.index.count;m.userData.dl=rnd()*.35;
  tg.setDrawRange(0,0);G.add(m);roots.push(m)}
 // дрожь: трещины шире и шире, прыгают камни, бегут волны пыли
 const cr=UFX.cracks(x,z,RR+4,0x7aff50,{dark:0x1a1008}),cr2=UFX.cracks(x,z,RR*.55,0xb0ff70,{dark:0x140c06});
 FX3.seal(x,.14,z,20,0x66ff88,L,0,3);UFX.dustRing(x,z,30,40,7,0x6a5a48,2.4,1);sBoomB(.8*v);lite(x,6,z,0x88ff44,2.5);
 let tk=0,rk=0,hit=0;
 fxo(G,L,(k,dt,t)=>{const out=k>.82?(1-k)/.18:1;
  roots.forEach((m,i)=>{const g=Math.max(0,Math.min(1,(t-m.userData.dl)/1.1))*out,n=Math.floor(g*48)*42;m.geometry.setDrawRange(0,n);m.position.y=Math.sin(t*30+i)*.08;
   if(g>0&&g<1&&rnd()<.35){const q=m.userData.c.getPointAt(Math.min(1,g));if(cam(x+q.x,z+q.z))return;UFX.puff(x+q.x,.8,z+q.z,(rnd()-.5)*4,3+rnd()*4,(rnd()-.5)*4,2.2,.7,0x6a5440,2,1,1);if(rnd()<.3)UFX.rock(x+q.x,.6,z+q.z,(rnd()-.5)*6,6+rnd()*8,(rnd()-.5)*6,.3+rnd()*.5,1.6,0x4a3a2a)}});
  cr.set(Math.min(1,t/1.4),.35+Math.min(.5,t*.3),out);cr2.set(Math.min(1,t/.8),.6,out);
  if((rk+=dt)>.06&&t<L-.8){rk=0;for(let n=0;n<2;n++){const a=rnd()*PI*2,r=rnd()*RR;if(cam(x+Math.cos(a)*r,z+Math.sin(a)*r))continue;UFX.rock(x+Math.cos(a)*r,.5,z+Math.sin(a)*r,0,5+rnd()*7,0,.25+rnd()*.5,1.2)}}
  if(!hit&&t>.5){hit=1;area(c,x,z,RR,2.2,{st:2.5})}
  if(t>.5&&(tk+=dt)>.6){tk=0;area(c,x,z,RR,.25,{st:.7})}});
 later(L,()=>{cr.kill();cr2.kill()})}

// 7 · УЛЬТА «Джаджанкен: Камень»: неуязвим, копит ауру (жёлтая — в стороны, ядро — чёрно-оранжевое, молнии) → удар → гигантский купол-взрыв
function jajan(){const{c,o,p,F,v}=cx(),mine=o===ME,TC=3,x=p.x,z=p.z,cp=new V3(x+F.x*2.4,3.6,z+F.z*2.4);
 o.wcI=Math.max(o.wcI||0,now()+TC+.8);if(mine)ME.hold=Math.max(ME.hold||0,TC+.25);
 if(vis(o))caption('ДЖАДЖАНКЕН…','#ffb020');if(mine)filt('saturate(1.35) contrast(1.12)');
 const ci=UFX.circles(x,z,22,[0xffcc33,0xff7a10,0xfff0b0],3),cr=UFX.cracks(x,z,26,0xffa020,{dark:0x1a0e04}),sh=UFX.shafts(x,z,7,120,0xffc030,8),lv=UFX.levitate(x,z,44,10,30,3,18,.7);
 FX3.seal(x,4.4,z,5,0xffd060,TC,0,3);FX3.seal(x,.15,z,12,0xffd060,TC,0,3);
 funnel(x,z,5.5,3.2,15,0xffdd33,TC+.1,{spin:3,up:2.2,rep:4,a:.85,fn:(k,dt,m)=>m.scale.set(1+k*1.6,1+k*.7,1+k*1.6)});
 const core=UFX.shell(cp.x,cp.y,cp.z,0xffcc33),inner=new T3.Mesh(SPH,dk(0x060202,1));inner.position.copy(cp);fxo(inner,TC,k=>inner.scale.setScalar(Math.max(.01,(k-.45)*3.2)));
 let bt=0,em=0,hv=0;
 UFX.run(TC,(t,dt)=>{const q=t/TC;ci.set(Math.min(1,q*2),t,2.5*q);cr.set(q,.4+q,1);sh.set(q*.7);sh.spin(dt);
  core.set(1.2+q*2.8,.6+q*1.6);core.m.material.uniforms.col.value.setHex(q<.5?0xffcc33:0xff6010);
  if((em+=dt)>.025){em=0;
   for(let n=0;n<3;n++){const a=rnd()*PI*2,sp=26+q*30;UFX.puff(x+Math.cos(a)*2,2+rnd()*4,z+Math.sin(a)*2,Math.cos(a)*sp,2+rnd()*4,Math.sin(a)*sp,3,.5,n?0xffd040:0xfff0a0,3,1,1.6)}   // аура бьёт в стороны
   for(let n=0;n<4;n++){const a=rnd()*PI*2,e=rnd()*PI,r=12+rnd()*10,sx=cp.x+Math.cos(a)*Math.sin(e)*r,sy=Math.max(.5,cp.y+Math.cos(e)*r*.6),sz=cp.z+Math.sin(a)*Math.sin(e)*r;emit(sx,sy,sz,(cp.x-sx)*3,(cp.y-sy)*3,(cp.z-sz)*3,.33,n&1?0xffe040:0xff7020,1.5,0)}}
  if(q>.35&&(bt+=dt)>.07){bt=0;for(let n=0;n<2;n++){const e=cp.clone().add(new V3((rnd()-.5)*26,(rnd()-.4)*14,(rnd()-.5)*26));e.y=Math.max(.3,e.y);hbolt(cp,e,n?0xff7a10:0xffd040,.16+q*.12,.14,{n:8,br:2})}}
  lite(cp.x,cp.y,cp.z,q<.5?0xffdd00:0xff6010,1.5+q*2.5);
  if(!hv&&t>TC-.55){hv=1;heavy(o)}},
  ()=>{core.kill();ci.kill();sh.kill();
   // ---- УДАР ----
   if(vis(o))caption('КАМЕНЬ!!','#ff6a10');if(mine)filt('saturate(1.6) contrast(1.25) brightness(1.15)');
   flash(.65);sBoomB(1.4*v);FX3.star(x,6,z,0xffffff,60,.6);FX3.star(x,6,z,0xffa030,110,1);FX3.gflash(x,z,120,0xff7a10,1.4);
   UFX.release(lv,140,70,5);UFX.burst(x,z,100,130,80,1.1,5.5);UFX.dustRing(x,z,40,120,14,0x8a6a48,4.5,2);
   const big=UFX.cracks(x,z,160,0xffa030,{dark:0x140a04}),s1=UFX.shell(x,0,z,0xfff0c0),s2=UFX.shell(x,0,z,0xff6a10);
   const dome=new T3.Mesh(HEMI,gm(0xff7a10,.85)),ring=new T3.Mesh(RNG,gm(0xffd080,.95));dome.position.set(x,0,z);ring.rotation.x=-PI/2;ring.position.set(x,1,z);
   const L2=3.2;fxo(dome,L2,k=>{const s=1+285*(1-Math.pow(1-k,2.2));dome.scale.set(s,s*.42,s);dome.material.opacity=.8*(1-k)});
   fxo(ring,L2,k=>{ring.scale.setScalar(1+290*(1-Math.pow(1-k,2)));ring.material.opacity=.95*(1-k)});
   for(let n=0;n<14;n++){const a=n/14*PI*2;later(n*.02,()=>hbolt(new V3(x,4,z),new V3(x+Math.cos(a)*(40+rnd()*40),.5,z+Math.sin(a)*(40+rnd()*40)),0xff7a10,.5,.4,{gr:1,n:12,br:3}))}
   area(c,x,z,150,6,{up:1.8});later(.6,()=>area(c,x,z,285,1.2));
   UFX.run(5,(t,dt)=>{big.set(Math.min(1,t/.4),Math.max(.25,2-t*.35),t<3.5?1:Math.max(0,1-(t-3.5)/1.5));s1.set(Math.min(170,8+t*260),Math.max(0,1-t/1.1)*1.6);s2.set(Math.min(240,4+t*170),Math.max(0,1-t/1.7)*1.3);
    lite(x,10,z,0xff6a10,4*Math.max(0,1-t/2));if(t>1.2&&t-dt<=1.2){caption('');if(mine)filt('')}},
    ()=>{big.kill();s1.kill();s2.kill();cr.kill();caption('');if(mine)filt('')})})}

// 8 · Молот Глейпнир: молот падает с неба, удар, волна Королевской воли — чёрные молнии с красным свечением ползут по земле и рвут воздух
function gleip(){const{c,p,F,v}=cx(),x=CL(p.x+F.x*22),z=CL(p.z+F.z*22),H=new T3.Group();heavy(CS());
 const hm=sm(0x1c0608,1,0x2a0004),hd=new T3.Mesh(shg(new T3.BoxGeometry(10,7,14)),hm),hl=new T3.Mesh(shg(new T3.CylinderGeometry(.9,1.1,18,10)),sm(0x141010,1));hl.position.y=12.5;
 const eg=new T3.LineSegments(new T3.EdgesGeometry(new T3.BoxGeometry(10.2,7.2,14.2)),new T3.LineBasicMaterial({color:0xff1030,transparent:true,blending:AB,depthWrite:false}));
 const gw=new T3.Mesh(shg(new T3.BoxGeometry(11,8,15)),gm(0xff0022,.1));H.add(hd,hl,eg,gw);H.position.set(x,62,z);H.rotation.y=Math.atan2(F.x,F.z);
 FX3.seal(x,.15,z,22,0xff2040,2,0,3);
 let hit=0,bt=0;
 fxo(H,2.4,(k,dt,t)=>{if(t<.45){const s=t/.45;H.position.y=62-58.5*s*s;if(rnd()<.6)hbolt(new V3(x+(rnd()-.5)*10,H.position.y+4,z+(rnd()-.5)*10),new V3(x+(rnd()-.5)*14,H.position.y+18,z+(rnd()-.5)*14),0xff1030,.25,.1,{n:6})}
  else{H.position.y=3.5;if(!hit){hit=1;impact()}if(t>1.8){const f=(2.4-t)/.6;hm.opacity=f;hl.material.opacity=f;eg.material.opacity=f;gw.material.opacity=.1*f}
   if(t<1.6&&(bt+=dt)>.06){bt=0;const n=K(4);for(let i=0;i<n;i++){const a=rnd()*PI*2,r=12+rnd()*58;
     hbolt(new V3(x+Math.cos(a)*4,.5,z+Math.sin(a)*4),new V3(x+Math.cos(a)*r,.4,z+Math.sin(a)*r),0xff1030,.35,.18,{gr:1,n:12,br:3});                 // по земле
     if(i<2)hbolt(new V3(x+(rnd()-.5)*8,6+rnd()*6,z+(rnd()-.5)*8),new V3(x+Math.cos(a)*r*.6,4+rnd()*16,z+Math.sin(a)*r*.6),0xff2040,.3,.16,{n:9,br:2})}}}}); // в воздухе
 function impact(){FX3.star(x,4,z,0xffffff,26,.4);FX3.star(x,4,z,0xff1030,50,.8);FX3.gflash(x,z,60,0xff0020,1);flash(.35);sBoomB(1.1*v);lite(x,6,z,0xff0022,3.5);
  orb(x,0,z,0xff1030,4,62,1.1);orb(x,0,z,0x400008,2,44,1.4,.05);
  const w=new T3.Mesh(RNG,gm(0xff1030,.95)),w2=new T3.Mesh(RNG,dk(0x0a0000,.8));w.rotation.x=w2.rotation.x=-PI/2;w.position.set(x,1.2,z);w2.position.set(x,1.1,z);
  fxo(w,1.2,k=>{w.scale.setScalar(2+k*75);w.material.opacity=.95*(1-k)});fxo(w2,1.2,k=>{w2.scale.setScalar(1.6+k*72);w2.material.opacity=.8*(1-k)});
  const cr=UFX.cracks(x,z,70,0xff1030,{dark:0x0c0204});UFX.run(3.4,t=>cr.set(Math.min(1,t*2.5),Math.max(0,1.6-t*.5),Math.max(0,1-(t-2.4))),()=>cr.kill());
  UFX.burst(x,z,50,46,34,1.3,3);UFX.dustRing(x,z,30,50,7,0x3a2a2a,2.2,1.5);
  area(c,x,z,32,3.2,{st:1.5});area(c,x,z,70,.9,{st:1})}}

// 9 · Рывок: вспышка и рывок на 24 вперёд, задевает по пути
function soru(){const{c,p,F}=cx(),g=CS().g,b=new V3(CL(p.x+F.x*24),0,CL(p.z+F.z*24));
 funnel(p.x,p.z,3,3,7,0x3ddc84,.35,{spin:4,up:3,a:.8});FX3.star(p.x,3,p.z,0x9affc8,6,.2);UFX.dustRing(p.x,p.z,8,14,3,0x8a8070,.9,1);
 let t=0;fx.push(dt=>{t+=dt;const k=Math.min(1,t/.18);g.position.x=p.x+(b.x-p.x)*k;g.position.z=p.z+(b.z-p.z)*k;
  for(let n=0;n<4;n++)emit(g.position.x+(rnd()-.5)*2,1+rnd()*5,g.position.z+(rnd()-.5)*2,0,1,0,.4,n&1?0x3ddc84:0xffffff,1.4,0);return k<1});
 line(c,p,b,4,1)}

return{sp:[punch,rubber,hawk,ape,tatsu,jukai,jajan,gleip,soru],
 IC:['👊','💥','🔥','🦍','🌪️','🌳','☄️','🔨','⚡'],
 NM:['Удар кулаком','Резиновый взрыв','Красный Ястреб','Обезьянья пушка','Тацумаки','Дзюкай Котан','Джаджанкен: Камень','Молот Глейпнир','Рывок'],
 cdm:[1,5,9,11,14,30,180,35,6],dur:[.4,.9,3,1.4,2.8,5,8.4,2.4,.3]}})();
CLS.push({sp:[...ANC.sp,wallSh,domeSh],cdm:[...ANC.cdm,6,5.2],dur:[...ANC.dur,3.4,2.5],
 ic:CLS[0].ic.map((x,i)=>i<9?ANC.IC[i]:x),nu:CLS[0].nu.map((x,i)=>i<9?(i==6?'7/R':String(i+1)):x),
 tx:CLS[0].tx.map((x,i)=>i<9?(i+1)+' · '+ANC.NM[i]:x),nm:CLS[0].nm.map((x,i)=>i<9?ANC.IC[i]+' '+ANC.NM[i]+(i==6?' (ульта)':''):x)});
