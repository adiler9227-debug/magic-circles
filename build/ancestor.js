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
function caption(txt,col){if(!capE){capE=document.createElement('div');capE.style.cssText='position:fixed;left:0;right:0;top:30%;text-align:center;font:900 clamp(34px,9vw,96px) "Yu Gothic","Hiragino Sans","Noto Sans JP","Noto Sans CJK JP","Meiryo",system-ui,sans-serif;letter-spacing:.1em;pointer-events:none;z-index:30;opacity:0;transition:opacity .25s,transform 1.4s ease-out;transform:scale(.8)';document.body.appendChild(capE)}
 clearTimeout(capT);if(!txt){capE.style.opacity=0;capE.style.transform='scale(.8)';return}
 capE.textContent=txt;capE.style.color='#fff6d8';capE.style.textShadow='0 0 16px '+col+',0 0 40px '+col+',0 0 90px '+col;capE.style.opacity=1;capE.style.transform='scale(1.08)'}
const vis=o=>o===ME||kv(o)>.45;
const filt=f=>{try{R.domElement.style.filter=f||''}catch(e){}};
// ---------- взрыв-шар (френель) ----------
function orb(x,y,z,col,r0,r1,life,d){later(d||0,()=>{const s=UFX.shell(x,y,z,col);UFX.run(life,t=>{const k=t/life;s.set(r0+(r1-r0)*(1-Math.pow(1-k,3)),(1-k)*1.6)},()=>s.kill())})}
// ---------- общее: убивать и «бессмертных» (золотых) мобов, отбрасывать всех, закручивать в вихрь, камера ----------
const withDM=fn=>{const s=dm;dm=true;try{fn()}finally{dm=s}};
function areaK(c,x,z,r,mul,op){withDM(()=>area(c,x,z,r,mul,op))}
function push(c,x,z,r,up,sp){forE((i,qx,qz)=>{if(!isB(i)&&Math.hypot(qx-x,qz-z)<r)eUp(i,x,z,up)});
 for(const q of players){if(!c||q===c.o||q.dead>0||(typeof COOPM==='function'&&COOPM()))continue;const dx=q.g.position.x-x,dz=q.g.position.z-z,d=Math.hypot(dx,dz);if(d<r){const s=sp*(1-d/r*.5);q.kx=(d>.3?dx/d:1)*s;q.kz=(d>.3?dz/d:0)*s}}}
function swirl(x,z,r,w,ring,dt){forE((i,qx,qz)=>{if(isB(i))return;const dx=qx-x,dz=qz-z,d=Math.hypot(dx,dz);if(d>r||d<.1)return;const a=Math.atan2(dz,dx)+w*dt,nd=d+(ring-d)*Math.min(1,dt*2.5);ex[i]=x+Math.cos(a)*nd;ez[i]=z+Math.sin(a)*nd})}
// при дальней камере туман реже, а прорисовка дальше — иначе всё тонет в синем; fogK(1) — вернуть как было
const fogK=r=>{try{window.FOGK=r?1:Math.max(1,BLK.CAM.z/2.5)}catch(e){}};   // движок камеры сам делит плотность тумана на FOGK и отодвигает прорисовку
const camTo=(zz,yy,dt)=>{try{const C=BLK.CAM,k=Math.min(1,dt*2.5);C.z+=(zz-C.z)*k;C.y+=(yy-C.y)*k}catch(e){}},camReset=()=>{try{BLK.CAM.z=1;BLK.CAM.y=0}catch(e){}};
// волна-полумесяц, летит вперёд (как удар мечника / аметистовый клинок)
function crescent(p,F,y,len,sc,col,life,d){const G=new T3.Group(),m=new T3.Mesh(CRES,gm(col,.95));m.rotation.set(-PI/2,0,-2.749);G.add(m);G.rotation.y=Math.atan2(F.x,F.z);
 fxo(G,life,k=>{const dd=2+k*len;G.position.set(p.x+F.x*dd,y,p.z+F.z*dd);G.scale.setScalar(sc*(.6+k*.6));m.material.opacity=.95*(1-k*k)},d)}

// 1 · Удар кулаком (и ЛКМ): хлопок у кулака и волна-полумесяц вперёд, лёгкий отброс
function punch(){const{c,p,F,v}=cx(),x0=p.x+F.x*2.2,z0=p.z+F.z*2.2,x=p.x+F.x*8,z=p.z+F.z*8;
 const r=new T3.Mesh(RNG,gm(0xffffff,.95));r.position.set(x0,3.2,z0);r.lookAt(x0+F.x,3.2,z0+F.z);fxo(r,.25,k=>{r.scale.setScalar(1+k*7);r.material.opacity=.95*(1-k)});
 crescent(p,F,3,16,9,0xffffff,.32);crescent(p,F,2.6,14,11,0xffaa44,.36,.03);
 FX3.star(x0,3.2,z0,0xffffff,7,.2);FX3.sparks(x,3,z,10,24,6,0xffaa33,.35);UFX.puff(x,2,z,F.x*10,1,F.z*10,3,.6,0x8a7a70,3,.5,1);
 lite(x0,3,z0,0xffcc66,1.4);sBoomB(.35*v);area(c,x,z,7,.5,{st:.2});push(c,x,z,8,.5,18)}

// 2 · Резиновый взрыв: удар — взрыв в точке, всех отбрасывает
function rubber(){const{c,p,F,v}=cx(),x=CL(p.x+F.x*16),z=CL(p.z+F.z*16);
 later(.12,()=>{
  FX3.star(x,3,z,0xffffff,14,.3);orb(x,3,z,0xffa040,1,11,.55);
  const w=new T3.Mesh(RNG,gm(0xfff0d0,.95));w.position.set(x,3,z);w.lookAt(x+F.x,3,z+F.z);fxo(w,.35,k=>{w.scale.setScalar(2+k*12);w.material.opacity=.95*(1-k)});
  const g=new T3.Mesh(RNG,gm(0xff8833,.9));g.rotation.x=-PI/2;g.position.set(x,.35,z);fxo(g,.6,k=>{g.scale.setScalar(2+k*16);g.material.opacity=.9*(1-k)});
  const cr=UFX.cracks(x,z,9,0xff7a30);UFX.run(2,t=>cr.set(Math.min(1,t*6),Math.max(0,1.2-t*.8),Math.max(0,1-(t-1.2)/.8)),()=>cr.kill());
  UFX.burst(x,z,14,24,18,.6,2);UFX.dustRing(x,z,12,18,4,0x8a7064,1.3,1);
  lite(x,4,z,0xff7722,2.5);sBoomB(.7*v);area(c,x,z,10,1.3,{st:.4});push(c,x,z,13,1.2,40)})}

// 3 · Красный Ястреб: огненный удар уходит вперёд и разрастается в сжигающий торнадо, который закручивает всех
function hawk(){const{c,p,F,v}=cx(),tg={x:CL(p.x+F.x*22),z:CL(p.z+F.z*22)},L=3.4;
 let t0=0;fx.push(dt=>{t0+=dt;const k=Math.min(1,t0/.28),x=p.x+(tg.x-p.x)*k,z=p.z+(tg.z-p.z)*k;
  for(let n=0;n<2;n++)UFX.puff(x+(rnd()-.5)*2,2+rnd()*2,z+(rnd()-.5)*2,(rnd()-.5)*4,4+rnd()*4,(rnd()-.5)*4,2.6,.5,n?0xff5a10:0xffc040,2.5,3,.8);return k<1});
 later(.28,()=>{const x=tg.x,z=tg.z,R=k=>6+k*16;
  FX3.star(x,4,z,0xffd080,16,.4);sBoomB(.7*v);FX3.seal(x,.14,z,16,0xffd060,L,0,3);
  const cr=UFX.cracks(x,z,24,0xff6a10);
  funnel(x,z,4,2,10,0xff5a10,L,{spin:2.6,up:1.6,rep:4,fn:(k,dt,m)=>m.scale.set(1+k*4.2,1+k*3.6,1+k*4.2)});
  funnel(x,z,2.6,1.4,9,0xffc040,L,{spin:-3.4,up:2,rep:3,a:.85,fn:(k,dt,m)=>m.scale.set(1+k*4,1+k*3.4,1+k*4)});
  let tk=0,em=0;area(c,x,z,8,.5,{st:.3});
  UFX.run(L,(t,dt)=>{const k=t/L,r=R(k);cr.set(Math.min(1,k*1.4),.6+k,Math.max(0,1-(t-L+.5)/.5));lite(x,6,z,0xff4400,2+k*2);
   if((em+=dt)>.03){em=0;for(let n=0;n<3;n++){const a=t*7+n*2.1+rnd()*.5,h=rnd()*(10+k*34),rr=1.5+h*(.3+k*.12);UFX.puff(x+Math.cos(a)*rr,1+h,z+Math.sin(a)*rr,-Math.sin(a)*16,6+rnd()*6,Math.cos(a)*16,2.4+h*.1,.7,rnd()<.5?0xff4a10:0xffb030,2,4,.9)}}
   swirl(x,z,r+4,3.2,r*.55,dt);
   if((tk+=dt)>.3){tk=0;area(c,x,z,r,.12)}},()=>{cr.kill();push(c,x,z,R(1)+4,1.2,40)})})}

// 4 · Обезьянья пушка: сжатие → огромный взрыв по области, все улетают
function ape(){const{c,p,F,v}=cx(),x=CL(p.x+F.x*16),z=CL(p.z+F.z*16);heavy(CS());
 const core=new T3.Mesh(SPH,dk(0x120404,.95));core.position.set(x,3,z);fxo(core,.28,k=>core.scale.setScalar(4*(1-k)+.3));
 FX3.star(x,3,z,0xff3010,10,.28);for(let n=0;n<20;n++){const a=rnd()*PI*2,e=(rnd()-.5)*2,r=14;emit(x+Math.cos(a)*r,3+e*4,z+Math.sin(a)*r,-Math.cos(a)*50,-e*14,-Math.sin(a)*50,.28,n&1?0xff6020:0xffffff,1.6,0)}
 area(c,x,z,10,.5);
 later(.28,()=>{FX3.star(x,4,z,0xffffff,30,.4);FX3.star(x,4,z,0xff5020,46,.7);FX3.gflash(x,z,34,0xff4010,.9);flash(.3);
  orb(x,3,z,0xffb070,2,30,.7);orb(x,3,z,0xff3010,1,22,.9,.06);
  for(const[r,cl,d]of[[34,0xffd0a0,0],[26,0xff5020,.08],[18,0xffffff,.16]]){const g=new T3.Mesh(RNG,gm(cl,.95));g.rotation.x=-PI/2;g.position.set(x,.4,z);fxo(g,.7,k=>{g.scale.setScalar(2+k*r);g.material.opacity=.95*(1-k)},d)}
  const cr=UFX.cracks(x,z,32,0xff5a20);UFX.run(3.4,t=>cr.set(Math.min(1,t*5),Math.max(0,1.4-t*.5),Math.max(0,1-(t-2.4))),()=>cr.kill());
  UFX.burst(x,z,55,60,40,.9,3.2);UFX.dustRing(x,z,26,46,7,0x7a6458,2.2,1.5);FX3.sparks(x,3,z,30,46,24,0xffa040,.7);
  lite(x,6,z,0xff5020,3.5);sBoomB(1.1*v);area(c,x,z,28,2,{up:2});push(c,x,z,30,2,55)})}

// 5 · Тацумаки: гигантский ветряной смерч с драконом и разрезами — два раза закручивает всех и выкидывает
function tatsu(){const{c,o,p,v}=cx(),x=p.x,z=p.z,L=3.2,RR=34;
 funnel(x,z,36,8,58,0xe8fff4,L,{spin:2.6,up:1.6,grow:1,rep:7,a:1});funnel(x,z,24,5,50,0x55ffaa,L,{spin:-3.4,up:2.2,grow:1,rep:6,a:1});funnel(x,z,12,3,40,0xffffff,L,{spin:4.5,up:3,grow:1,rep:4,a:.8});
 FX3.seal(x,.14,z,22,0x66ddff,L,0,3);UFX.dustRing(x,z,26,44,7,0x8aa090,2,1);sBoomB(.6*v);lite(x,10,z,0x3ddc84,3);
 // ветряной дракон: светящаяся лента-змей летит по спирали вверх
 const D=new T3.Group(),cmD=gm(0xffffff,.9),glD=gm(0x3ddc84,.7),c1=new T3.Mesh(new T3.BufferGeometry(),cmD),g1=new T3.Mesh(new T3.BufferGeometry(),glD),hd=new T3.Mesh(SPH,gm(0xe8fff0,.9));D.add(g1,c1,hd);D.position.set(x,0,z);
 const path=u=>{const a=u*7,r=10+Math.sin(u*2.3)*4+u*1.5;return new V3(Math.cos(a)*r,2+u*12,Math.sin(a)*r)};
 const rib=(m,pts,w)=>{const old=m.geometry;m.geometry=ribG(pts,w);old.dispose()};
 fxo(D,L,(k,dt,t)=>{const h=t*1.4,pts=[];for(let i=0;i<28;i++)pts.push(path(Math.max(0,h-i*.06)));const f=Math.min(1,(1-k)*4);
  rib(c1,pts,1);rib(g1,pts,3.2);cmD.opacity=.9*f;glD.opacity=.7*f;hd.position.copy(pts[0]);hd.scale.setScalar(2.3);hd.material.opacity=.9*f;FX3.star(x+pts[0].x,pts[0].y,z+pts[0].z,0x9affc8,7,.1);
  if(rnd()<.6)emit(pts[0].x+x,pts[0].y,pts[0].z+z,(rnd()-.5)*6,(rnd()-.5)*6,(rnd()-.5)*6,.5,rnd()<.5?0xffffff:0x3ddc84,1.4,0)});
 for(let i=0;i<16;i++){const m=new T3.Mesh(CRES,gm(i&1?0xffffff:0x9affc8,.9)),r=4+rnd()*22,y=2+rnd()*34,a0=rnd()*PI*2,sp=(rnd()<.5?-1:1)*(3+rnd()*4);m.scale.setScalar(4+rnd()*5);
  fxo(m,.9+rnd()*.8,(k,dt,t)=>{const a=a0+t*sp;m.position.set(x+Math.cos(a)*r,y+t*6,z+Math.sin(a)*r);m.rotation.set(rnd()*.2+1.2,a,t*14);m.material.opacity=.9*Math.sin(k*PI)},rnd()*2)}
 area(c,x,z,RR,.3);let em=0,f1=0,f2=0;
 UFX.run(L,(t,dt)=>{if((em+=dt)>.04){em=0;for(let n=0;n<3;n++){const a=rnd()*PI*2,r=6+rnd()*28;UFX.puff(x+Math.cos(a)*r,1,z+Math.sin(a)*r,-Math.sin(a)*28,12+rnd()*10,Math.cos(a)*28,3.4,.8,0x9ab0a0,2,6,.6)}}
  if(t<1.4||(t>1.55&&t<2.9))swirl(x,z,RR,3.6,12,dt);
  if(!f1&&t>=1.4){f1=1;areaK(c,x,z,RR,.9,{up:1.7});push(c,x,z,RR,1.7,45);sBoomB(.5*v)}
  if(!f2&&t>=2.9){f2=1;areaK(c,x,z,RR,.9,{up:1.9});push(c,x,z,RR,1.9,50);sBoomB(.6*v)}})}

// 6 · Дзюкай Котан (полуульта): земля дрожит и трескается, корни ползут по земле вокруг героя (видны только их спины), всех отбрасывает
function jukai(){const{c,o,p,F,v}=cx(),x=p.x,z=p.z,L=3,RR=46;heavy(o);const ab=Math.atan2(-F.z,-F.x),cam=(px,pz)=>(px-x)*F.x+(pz-z)*F.z<2&&Math.hypot(px-x,pz-z)<20;
 const G=new T3.Group(),roots=[];G.position.set(x,0,z);
 const mat=()=>sm(0x3e2614,1,0x120802);
 for(let i=0;i<K(26);i++){const an=i/K(26)*PI*2+(rnd()-.5)*.25;let da=Math.abs(((an-ab)%(PI*2)+PI*3)%(PI*2)-PI);if(da<.75)continue;const len=RR*(.7+rnd()*.3),pts=[],th=.75+rnd()*.7,ph=rnd()*9,arch=rnd()<.45?2+Math.floor(rnd()*4):-1;
  for(let s=0;s<=12;s++){const u=s/12,d=3+u*len,wv=Math.sin(u*7+ph)*4*u,y=-th*.45+(s===arch?th*1.8:0)+Math.sin(u*11+ph)*.25;
   pts.push(new V3(Math.cos(an)*d-Math.sin(an)*wv,y,Math.sin(an)*d+Math.cos(an)*wv))}
  const tg=new T3.TubeGeometry(new T3.CatmullRomCurve3(pts),48,th*.9,7,false),m=new T3.Mesh(tg,mat());m.userData.c=new T3.CatmullRomCurve3(pts);m.userData.dl=rnd()*.15;
  tg.setDrawRange(0,0);G.add(m);roots.push(m)}
 const cr=UFX.cracks(x,z,RR+4,0x7aff50,{dark:0x1a1008}),cr2=UFX.cracks(x,z,RR*.55,0xb0ff70,{dark:0x140c06});
 FX3.seal(x,.14,z,20,0x66ff88,L,0,3);UFX.dustRing(x,z,30,40,7,0x6a5a48,2.4,1);sBoomB(.8*v);lite(x,6,z,0x88ff44,2.5);
 let tk=0,rk=0,hit=0;
 fxo(G,L,(k,dt,t)=>{const out=k>.82?(1-k)/.18:1,rt=t<1?1:Math.max(0,1-(t-1)/.3);
  roots.forEach((m,i)=>{const g=Math.max(0,Math.min(1,(t-m.userData.dl)/.28))*rt,n=Math.floor(g*48)*42;m.geometry.setDrawRange(0,n);m.position.y=Math.sin(t*30+i)*.08;
   if(g>0&&g<1&&rnd()<.35){const q=m.userData.c.getPointAt(Math.min(1,g));if(cam(x+q.x,z+q.z))return;UFX.puff(x+q.x,.8,z+q.z,(rnd()-.5)*4,3+rnd()*4,(rnd()-.5)*4,2.2,.7,0x6a5440,2,1,1);if(rnd()<.3)UFX.rock(x+q.x,.6,z+q.z,(rnd()-.5)*6,6+rnd()*8,(rnd()-.5)*6,.3+rnd()*.5,1.6,0x4a3a2a)}});
  cr.set(Math.min(1,t/1.4),.35+Math.min(.5,t*.3),out);cr2.set(Math.min(1,t/.8),.6,out);
  if((rk+=dt)>.06&&t<L-.8){rk=0;for(let n=0;n<2;n++){const a=rnd()*PI*2,r=rnd()*RR;if(cam(x+Math.cos(a)*r,z+Math.sin(a)*r))continue;UFX.rock(x+Math.cos(a)*r,.5,z+Math.sin(a)*r,0,5+rnd()*7,0,.25+rnd()*.5,1.2)}}
  if(!hit&&t>.3){hit=1;area(c,x,z,RR,1.6,{up:1.1});push(c,x,z,RR,1.1,35)}
  });

 later(L,()=>{cr.kill();cr2.kill()})}

// 7 · УЛЬТА «Джаджанкен: Камень» — под звуковую дорожку jajanken.mp3 (12.5 с, удар на ~9-й секунде).
//     0–8.9 с: неуязвим, стоит; камера медленно отъезжает; чёрно-оранжевый шар растёт до радиуса 36 (героя не видно), молнии и искры во все стороны.
//     8.9 с: удар-хлопок → волна 1 (поменьше) → через 1.1 с волна 2 (больше, почти на всю карту). Землетрясение. Убивает всех в зоне (и золотых).
// звук техники из файла: качается сразу, декодируется, когда появится звук игры (после первого касания)
function mkSnd(url,vol){let raw=null,buf=null,busy=0;
 try{fetch(url).then(r=>r.ok?r.arrayBuffer():null).then(b=>{raw=b}).catch(()=>{})}catch(e){}
 const dec=()=>{if(buf||busy||!raw||!AC)return;busy=1;try{AC.decodeAudioData(raw.slice(0),b=>{buf=b},()=>{busy=0})}catch(e){busy=0}};
 const iv=setInterval(()=>{dec();if(buf)clearInterval(iv)},1000);
 return v=>{dec();if(!AC||!buf)return;try{const s=AC.createBufferSource(),g=AC.createGain();s.buffer=buf;g.gain.value=vol*v;s.connect(g);g.connect(AC.destination);s.start()}catch(e){}}}
const ULT_SND=mkSnd('jajanken.mp3',1);
function jajan(){const{c,o,p,F,v}=cx(),mine=o===ME,TC=8.9,x=p.x,z=p.z,RZ=285;
 o.wcI=Math.max(o.wcI||0,now()+TC+2.2);if(mine)ME.hold=Math.max(ME.hold||0,TC+.3);
 if(vis(o))ULT_SND(Math.max(.25,v));
 if(vis(o))caption('ジャジャン拳…','#ffb020');if(mine)filt('saturate(1.35) contrast(1.12)');
 const ci=UFX.circles(x,z,40,[0xffcc33,0xff7a10,0xfff0b0],3),cr=UFX.cracks(x,z,60,0xffa020,{dark:0x1a0e04}),sh=UFX.shafts(x,z,14,200,0xffc030,10),lv=UFX.levitate(x,z,60,40,80,4,40,1.2);
 FX3.seal(x,.15,z,30,0xffd060,TC,0,3);
 const ease=q=>1-Math.pow(1-q,1.8),BR=q=>.8+104*ease(q),BY=q=>4.5+BR(q)*.45;     // радиус шара до 36, центр поднимается вместе с ним
 const BC=new V3(x,4.5,z),core=UFX.shell(x,4.5,z,0xffcc33),ball=new T3.Mesh(SPH,dk(0x1c0700,.97)),bg=new T3.Mesh(SPH,gm(0xff7a10,.55));ball.renderOrder=3;
 fxo(ball,TC,(k,dt,t)=>{const r=BR(k)*(1+Math.sin(t*(8+k*30))*.02*k);BC.y=BY(k);ball.position.copy(BC);bg.position.copy(BC);ball.scale.setScalar(r);bg.scale.setScalar(r*1.07);bg.material.opacity=.35+.3*k+Math.sin(t*25)*.08});fxo(bg,TC,()=>{});
 let bt=0,em=0,hv=0;
 UFX.run(TC,(t,dt)=>{const q=t/TC,br=BR(q);ci.set(Math.min(1,q*2),t,4*q);cr.set(q,.4+q,1);sh.set(Math.min(.8,q*1.2));sh.spin(dt);
  if(mine){camTo(16,102,dt*2.2);fogK()}                                      // медленное отъезжание камеры
  core.m.position.copy(BC);core.set(br*1.16,.8+q*1.4);core.m.material.uniforms.col.value.setHex(q<.35?0xffcc33:0xff6010);
  if((em+=dt)>.03){em=0;
   for(let n=0;n<3;n++){const a=rnd()*PI*2,sp=30+q*50;UFX.puff(x+Math.cos(a)*(br*.8),2+rnd()*4,z+Math.sin(a)*(br*.8),Math.cos(a)*sp,2+rnd()*4,Math.sin(a)*sp,4+q*5,.6,n?0xffd040:0xfff0a0,4,1,1.6)}  // аура бьёт в стороны
   for(let n=0;n<8;n++){const a=rnd()*PI*2,e=rnd()*PI*.55,dx=Math.cos(a)*Math.sin(e),dy=Math.cos(e),dz=Math.sin(a)*Math.sin(e),sp=40+rnd()*60;emit(BC.x+dx*br,BC.y+dy*br,BC.z+dz*br,dx*sp,dy*sp*.7,dz*sp,.7,n&1?0xffe040:0xff7020,2.2+q*2,-8)}}  // искры с поверхности
  if(q>.1&&(bt+=dt)>.04){bt=0;for(let n=0;n<K(12);n++){const a=rnd()*PI*2,e=rnd()*PI*.6,d=new V3(Math.cos(a)*Math.sin(e),Math.cos(e),Math.sin(a)*Math.sin(e)),s0=BC.clone().addScaledVector(d,br*.97),L=30+rnd()*70+q*120,e1=s0.clone().addScaledVector(d,L);e1.y=Math.max(.3,e1.y);
    hbolt(s0,e1,n%3?0xff7a10:0xffd040,.35+q*.8,.14,{n:10,br:3,j:3+q*3})}}               // молнии во все стороны
  lite(BC.x,BC.y+br,BC.z,q<.5?0xffdd00:0xff6010,2+q*3);
  if(!hv&&t>TC-.55){hv=1;heavy(o)}},
  ()=>{core.kill();ci.kill();sh.kill();
   // ---- УДАР-ХЛОПОК ----
   if(vis(o))caption('グー!!','#ff6a10');if(mine)filt('saturate(1.6) contrast(1.25) brightness(1.15)');
   flash(.85);FX3.star(x,BC.y,z,0xffffff,120,.6);FX3.star(x,BC.y,z,0xffa030,200,1);FX3.gflash(x,z,160,0xff7a10,1.4);
   UFX.release(lv,140,70,5);UFX.burst(x,z,100,140,80,1.2,5.5);UFX.dustRing(x,z,44,150,16,0x8a6a48,4.5,2);
   const big=UFX.cracks(x,z,RZ,0xffa030,{dark:0x140a04});
   // две волны: первая поменьше (до 150), вторая больше (почти на всю карту)
   const wave=(R,d,col)=>later(d,()=>{const s0=UFX.shell(x,3,z,0xffffff),s1=UFX.shell(x,0,z,col),dome=new T3.Mesh(HEMI,gm(col,.85)),ring=new T3.Mesh(RNG,gm(0xffd080,.95)),wv=new T3.Mesh(RNG,gm(0xffffff,.9));
     dome.position.set(x,0,z);ring.rotation.x=wv.rotation.x=-PI/2;ring.position.set(x,1,z);wv.position.set(x,1.4,z);flash(.6);FX3.star(x,8,z,0xffffff,R*.6,.5);
     fxo(dome,2.6,k=>{const s=1+R*(1-Math.pow(1-k,2.2));dome.scale.set(s,s*.42,s);dome.material.opacity=.8*(1-k)});
     fxo(ring,2.6,k=>{ring.scale.setScalar(1+(R+5)*(1-Math.pow(1-k,2)));ring.material.opacity=.95*(1-k)});
     fxo(wv,.8,k=>{wv.scale.setScalar(2+R*k);wv.material.opacity=.9*(1-k)});
     UFX.run(2.4,t=>{s0.set(Math.min(R*.5,2+t*R*1.6),Math.max(0,1-t/.45)*2);s1.set(Math.min(R*.8,6+t*R*.9),Math.max(0,1-t/1.5)*1.5)},()=>{s0.kill();s1.kill()});
     areaK(c,x,z,R,1000,{up:2.2});push(c,x,z,R,2.2,85)});
   wave(150,0,0xff8a20);wave(RZ,1.1,0xff6a10);
   let lb=0;
   UFX.run(6,(t,dt)=>{big.set(Math.min(1,t/.6),Math.max(.25,2-t*.3),t<4.5?1:Math.max(0,1-(t-4.5)/1.5));
    lite(x,12,z,0xff6a10,4*Math.max(0,1-t/2.5));
    if(mine){if(t<3)camTo(24,224,dt*3);else camTo(1,0,dt*.9);fogK()}                       // отдаление «как Шинра Тенсей»
    if(t<3&&(lb+=dt)>.04){lb=0;for(let n=0;n<K(14);n++){const a=rnd()*PI*2,r0=rnd()*Math.min(RZ,40+t*200),r1=r0+25+rnd()*50,a1=a+(rnd()-.5)*.5;   // молнии по всей области
      hbolt(new V3(x+Math.cos(a)*r0,.5,z+Math.sin(a)*r0),new V3(x+Math.cos(a1)*r1,.4,z+Math.sin(a1)*r1),n&1?0xff7a10:0xffd040,.8,.22,{gr:1,n:10,br:3,j:4})}
     for(let m=0;m<3;m++){const a=rnd()*PI*2,r=rnd()*240;hbolt(new V3(x+Math.cos(a)*r,50+rnd()*40,z+Math.sin(a)*r),new V3(x+Math.cos(a)*r+(rnd()-.5)*14,.5,z+Math.sin(a)*r+(rnd()-.5)*14),0xffa030,1,.2,{n:12,br:4,j:5})}}
    if(t<3.2&&rnd()<.85){for(let n=0;n<K(6);n++){const a=rnd()*PI*2,r=8+rnd()*Math.min(RZ,30+t*160);UFX.rock(x+Math.cos(a)*r,.5,z+Math.sin(a)*r,(rnd()-.5)*4,7+rnd()*14,(rnd()-.5)*4,.4+rnd()*.9,1.4)}       // землетрясение
     if(rnd()<.4){const a=rnd()*PI*2,r=20+rnd()*Math.min(RZ,40+t*150);UFX.puff(x+Math.cos(a)*r,1,z+Math.sin(a)*r,Math.cos(a)*12,3,Math.sin(a)*12,8,1.4,0x7a6450,8,.4,1)}}
    if(t>2.4&&t-dt<=2.4){caption('');if(mine)filt('')}},
    ()=>{big.kill();cr.kill();caption('');if(mine){filt('');camReset();fogK(1)}})})}

// 8 · Молот Глейпнир — под дорожку gleipnir.mp3 (12.6 с). Молот медленно падает, удар усиленной Королевской волей,
//     потом, пока играет дорожка, из героя во все стороны бьют чёрно-красные молнии воли: всем в зоне −1.5% здоровья каждую секунду, герой полностью чёрный.
//     На пиках музыки (6.4 и 10.7 с) — мощные выбросы воли.
function blacken(o){const m=MO(o),saved=[];if(!m||!m.g)return()=>{};
 m.g.traverse(q=>{if(q.isMesh&&q.material){saved.push([q,q.material]);q.material=new T3.MeshBasicMaterial({color:0x060002,skinning:!!q.isSkinnedMesh})}});
 return()=>saved.forEach(([q,mt])=>{if(q.material!==mt){q.material.dispose();q.material=mt}})}
const WALL=shg(new T3.CylinderGeometry(1,1.06,1,72,1,true).translate(0,.5,0));
function hakiWave(X,Z,R,H,life){const G=new T3.Group(),gl=new T3.Mesh(WALL,gm(0xff1030,.7)),cr=new T3.Mesh(WALL,dk(0x0a0002,.85));cr.scale.set(.97,1,.97);G.add(gl,cr);G.position.set(X,0,Z);
 shock(X,Z,0x550010,R,life*.8);
 fxo(G,life,k=>{const r=2+R*(1-Math.pow(1-k,2)),h=H*(1-k)*Math.min(1,k*6);G.scale.set(r,Math.max(.01,h),r);gl.material.opacity=.7*(1-k);cr.material.opacity=.85*(1-k);
  for(let n=0;n<K(14);n++){const a=rnd()*PI*2;emit(X+Math.cos(a)*r,1+rnd()*h,Z+Math.sin(a)*r,Math.cos(a)*30,6+rnd()*14,Math.sin(a)*30,.6,n%3?0xff1030:0x1a0004,1.6,-20)}})}
const GLP_SND=mkSnd('gleipnir.mp3',1);
function gleip(){const{c,o,p,F,v}=cx(),x=CL(p.x+F.x*22),z=CL(p.z+F.z*22),H=new T3.Group(),TF=.95,DS=12.6,HR=85;heavy(CS());
 if(vis(o))GLP_SND(Math.max(.25,v));
 const hm=sm(0x1c0608,1,0x2a0004),hd=new T3.Mesh(shg(new T3.BoxGeometry(10,7,14)),hm),hl=new T3.Mesh(shg(new T3.CylinderGeometry(.9,1.1,18,10)),sm(0x141010,1));hl.position.y=12.5;
 const eg=new T3.LineSegments(new T3.EdgesGeometry(new T3.BoxGeometry(10.2,7.2,14.2)),new T3.LineBasicMaterial({color:0xff1030,transparent:true,blending:AB,depthWrite:false}));
 const gw=new T3.Mesh(shg(new T3.BoxGeometry(11,8,15)),gm(0xff0022,.1));H.add(hd,hl,eg,gw);H.position.set(x,72,z);H.rotation.y=Math.atan2(F.x,F.z);
 FX3.seal(x,.15,z,24,0xff2040,TF+1.6,0,3);
 let hit=0,bt=0;
 fxo(H,TF+2,(k,dt,t)=>{if(t<TF){const s=t/TF;H.position.y=72-68.5*s*s;H.rotation.z=Math.sin(t*3)*.05;if(rnd()<.7)hbolt(new V3(x+(rnd()-.5)*10,H.position.y+4,z+(rnd()-.5)*10),new V3(x+(rnd()-.5)*16,H.position.y+20,z+(rnd()-.5)*16),0xff1030,.3,.1,{n:6})}
  else{H.position.y=3.5;H.rotation.z=0;if(!hit){hit=1;impact()}if(t>TF+1.4){const f=(TF+2-t)/.6;hm.opacity=f;hl.material.opacity=f;eg.material.opacity=f;gw.material.opacity=.1*f}
   if(t<TF+1.8&&(bt+=dt)>.06){bt=0;const n=K(14);for(let i=0;i<n;i++){const a=rnd()*PI*2,r=20+rnd()*80;
     hbolt(new V3(x+Math.cos(a)*4,.6,z+Math.sin(a)*4),new V3(x+Math.cos(a)*r,.5,z+Math.sin(a)*r),0xff1030,.95,.2,{gr:1,n:14,br:5,j:4});
     if(i<5)hbolt(new V3(x+(rnd()-.5)*10,8+rnd()*8,z+(rnd()-.5)*10),new V3(x+Math.cos(a)*r*.7,6+rnd()*30,z+Math.sin(a)*r*.7),0xff2040,.75,.18,{n:11,br:3,j:4});
     if(i<2){const sx=x+Math.cos(a)*r*.8,sz=z+Math.sin(a)*r*.8;hbolt(new V3(sx+(rnd()-.5)*20,70,sz+(rnd()-.5)*20),new V3(sx,.5,sz),0xff3050,1.2,.22,{n:14,br:4,j:5});FX3.star(sx,1,sz,0xff1030,10,.2)}}}}});
 function impact(){FX3.star(x,4,z,0xffffff,40,.45);FX3.star(x,4,z,0xff1030,80,.9);FX3.gflash(x,z,80,0xff0020,1.1);flash(.5);lite(x,6,z,0xff0022,4);
  const cl=new T3.Mesh(RNG,gm(0xffffff,.95));cl.position.set(x,6,z);cl.lookAt(x+F.x,6,z+F.z);fxo(cl,.35,k=>{cl.scale.setScalar(3+k*40);cl.material.opacity=.95*(1-k)});
  orb(x,0,z,0xff1030,4,80,1.1);orb(x,0,z,0x400008,2,56,1.4,.05);orb(x,3,z,0xffffff,2,30,.35);
  const w=new T3.Mesh(RNG,gm(0xff1030,.95)),w2=new T3.Mesh(RNG,dk(0x0a0000,.8));w.rotation.x=w2.rotation.x=-PI/2;w.position.set(x,1.2,z);w2.position.set(x,1.1,z);
  fxo(w,1.2,k=>{w.scale.setScalar(2+k*90);w.material.opacity=.95*(1-k)});fxo(w2,1.2,k=>{w2.scale.setScalar(1.6+k*86);w2.material.opacity=.8*(1-k)});
  const cr=UFX.cracks(x,z,85,0xff1030,{dark:0x0c0204});UFX.run(3.4,t=>cr.set(Math.min(1,t*2.5),Math.max(0,1.6-t*.5),Math.max(0,1-(t-2.4))),()=>cr.kill());
  UFX.burst(x,z,50,50,36,1,3);UFX.dustRing(x,z,34,60,8,0x3a2a2a,2.4,1.5);hakiWave(x,z,85,22,1.3);
  for(let n=0;n<K(24);n++){const a=n/24*PI*2;hbolt(new V3(x,4,z),new V3(x+Math.cos(a)*(50+rnd()*40),.5,z+Math.sin(a)*(50+rnd()*40)),0xff1030,1.3,.35,{gr:1,n:16,br:5,j:5})}
  areaK(c,x,z,32,2.5,{st:1.5});areaK(c,x,z,85,.5,{st:1});push(c,x,z,85,1.5,60)}
 // ---- Королевская воля из героя, пока играет музыка ----
 const g=o.g,ring=new T3.Mesh(RNG,gm(0xff1030,.5));ring.rotation.x=-PI/2;
 let lt=0,tk=0,b1=0,b2=0,wt=0,pt=0;
 const burstW=(R,n)=>{const X=g.position.x,Z=g.position.z;flash(.35);FX3.star(X,4,Z,0xff1030,R*.6,.6);
  hakiWave(X,Z,R*.7,18,1.1);later(.25,()=>hakiWave(X,Z,R,26,1.4));for(let i=0;i<K(n);i++){const a=i/n*PI*2;hbolt(new V3(X,4,Z),new V3(X+Math.cos(a)*(R*.6+rnd()*R*.4),.5,Z+Math.sin(a)*(R*.6+rnd()*R*.4)),0xff1030,1.3,.35,{gr:1,n:16,br:5,j:5})}
  areaK(c,X,Z,R,.3,{st:1});push(c,X,Z,R,1.4,55)};
 later(TF+2,()=>{S.add(ring);const unB=blacken(o);
  UFX.run(DS-TF-2,(t,dt)=>{const T=TF+2+t,X=g.position.x,Z=g.position.z,f=Math.min(1,t*3,(DS-T)*2);
   ring.position.set(X,.8,Z);ring.scale.setScalar(HR*(.92+Math.sin(t*9)*.04));ring.material.opacity=.45*f;
   if((lt+=dt)>.07){lt=0;for(let i=0;i<K(6);i++){const a=rnd()*PI*2,r=25+rnd()*(HR-20),s=new V3(X+Math.cos(a)*1.5,2.5+rnd()*3,Z+Math.sin(a)*1.5);
     hbolt(s,new V3(X+Math.cos(a)*r,.5,Z+Math.sin(a)*r),i&1?0xff1030:0xff3a50,.7,.16,{gr:1,n:12,br:3,j:3.5});                                      // по земле от героя
     if(i<2)hbolt(s,new V3(X+Math.cos(a)*r*.5,6+rnd()*24,Z+Math.sin(a)*r*.5),0xff2040,.55,.14,{n:10,br:2,j:3})}                                 // в воздух
    for(let n=0;n<6;n++){const a=rnd()*PI*2,sp=30+rnd()*40;emit(X,3+rnd()*2,Z,Math.cos(a)*sp,(rnd()-.3)*12,Math.sin(a)*sp,.6,n&1?0xff1030:0x200004,1.8,0)}}   // искры воли
   lite(X,5,Z,0xff0022,2+Math.sin(t*20));
   // ветер воли: быстрые струи от героя во все стороны, пыль сдувает к краю зоны
   if((wt+=dt)>.03){wt=0;for(let n=0;n<K(5);n++){const a=rnd()*PI*2,r=3+rnd()*22,sp=70+rnd()*60;emit(X+Math.cos(a)*r,.5+rnd()*3,Z+Math.sin(a)*r,Math.cos(a)*sp,(rnd()-.3)*4,Math.sin(a)*sp,.4,n%3?0xffffff:0xff3050,1.1,0)}
    if(rnd()<.55){const a=rnd()*PI*2,r=6+rnd()*35;UFX.puff(X+Math.cos(a)*r,1,Z+Math.sin(a)*r,Math.cos(a)*40,2,Math.sin(a)*40,4,1.1,0x3a2a30,5,.3,.35)}}
   // давление воли: каждые 0.75 с тёмная волна и искажение воздуха, врагов слегка отжимает от героя
   if((pt+=dt)>.75){pt=0;hakiWave(X,Z,HR,6,.8);
    forE((i,qx,qz)=>{if(isB(i))return;const dx=qx-X,dz=qz-Z,d=Math.hypot(dx,dz);if(d<HR&&d>.1){ex[i]+=dx/d*2.5;ez[i]+=dz/d*2.5}})}
   if((tk+=dt)>=1){tk=0;if(c){const sv=dm;dm=true;try{forE((i,qx,qz)=>{if(Math.hypot(qx-X,qz-Z)<HR)eH(i,isB(i)?c.dmg*.15:Math.max(.5,hpv[i]*.015+c.dmg*.05))})}finally{dm=sv}   // −5% каждую секунду
     for(const q of players){if(q===c.o||q.dead>0||(typeof COOPM==='function'&&COOPM()))continue;const d=Math.hypot(q.g.position.x-X,q.g.position.z-Z);if(d<HR)pHurt(q,q.maxhp*.015,c.o,X,Z)}}}
   if(!b1&&T>=6.4){b1=1;burstW(70,20)}if(!b2&&T>=10.7){b2=1;burstW(95,28)}},
   ()=>{unB();S.remove(ring);ring.material.dispose()})})}

// 9 · Рывок: вспышка и рывок на 24 вперёд, задевает по пути
function soru(){const{c,p,F}=cx(),g=CS().g,b=new V3(CL(p.x+F.x*24),0,CL(p.z+F.z*24));
 funnel(p.x,p.z,3,3,7,0x3ddc84,.35,{spin:4,up:3,a:.8});FX3.star(p.x,3,p.z,0x9affc8,6,.2);UFX.dustRing(p.x,p.z,8,14,3,0x8a8070,.9,1);
 let t=0;fx.push(dt=>{t+=dt;const k=Math.min(1,t/.18);g.position.x=p.x+(b.x-p.x)*k;g.position.z=p.z+(b.z-p.z)*k;
  for(let n=0;n<4;n++)emit(g.position.x+(rnd()-.5)*2,1+rnd()*5,g.position.z+(rnd()-.5)*2,0,1,0,.4,n&1?0x3ddc84:0xffffff,1.4,0);return k<1});
 line(c,p,b,4,1)}

return{sp:[punch,rubber,hawk,ape,tatsu,jukai,jajan,gleip,soru],
 IC:['👊','💥','🔥','🦍','🌪️','🌳','☄️','🔨','⚡'],
 NM:['Удар кулаком','Резиновый взрыв','Красный Ястреб','Обезьянья пушка','Тацумаки','Дзюкай Котан','Джаджанкен: Камень','Молот Глейпнир','Рывок'],
 cdm:[.6,5,9,11,14,30,180,35,6],dur:[.4,.9,3.8,1.4,3.2,3,15,12.6,.3]}})();
CLS.push({sp:[...ANC.sp,wallSh,domeSh],cdm:[...ANC.cdm,6,5.2],dur:[...ANC.dur,3.4,2.5],
 ic:CLS[0].ic.map((x,i)=>i<9?ANC.IC[i]:x),nu:CLS[0].nu.map((x,i)=>i<9?(i==6?'7/R':i==0&&!isTouch?'1/ЛКМ':String(i+1)):x),
 tx:CLS[0].tx.map((x,i)=>i<9?(i+1)+' · '+ANC.NM[i]:x),nm:CLS[0].nm.map((x,i)=>i<9?ANC.IC[i]+' '+ANC.NM[i]+(i==6?' (ульта)':''):x)});
