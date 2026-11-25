// ===== 6-Й ГЕРОЙ «ПРЕДОК» (класс 5): умения. Вставляется сборкой перед «НОВЫЕ ТЕХНИКИ: Ниндзя» =====
// Умения вызываются без аргументов (кастер — CS()), урон — от CTX.dmg. Ульта — индекс 6, откат 180 с. Без тряски камеры.
const ANC=(function(){
const T3=THREE,V3=T3.Vector3,PI=Math.PI,{glm,eH,eUp,forE,stn,plT,bolt,kv,MO,face,isB,sBoomB}=BLK.H;
const CL=v=>Math.max(-292,Math.min(292,v));                                   // не дальше края карты 600×600
const gm=(c,o)=>{const m=glm(c,o);m.side=2;return m};                        // светящийся, видно с обеих сторон
const sm=(c,o,e)=>new T3.MeshLambertMaterial({color:c,emissive:e||0,transparent:true,opacity:o==null?1:o});
const shg=g=>{g.userData.sh=1;return g};
const SPH=shg(new T3.SphereGeometry(1,18,12)),RNG=shg(new T3.RingGeometry(.8,1,40)),RGW=shg(new T3.RingGeometry(.45,1,28)),
 HEMI=shg(new T3.SphereGeometry(1,32,16,0,PI*2,0,PI/2)),CYO=shg(new T3.CylinderGeometry(1,1,1,24,1,true).translate(0,.5,0));
// эффект-объект: живёт life сек, после — убирается и чистится (общие геометрии не трогаем)
function fxo(o,life,fn,d){let t=-(d||0);o.visible=false;S.add(o);
 fx.push(dt=>{t+=dt;if(t<0)return true;o.visible=true;const k=t/life;if(k>=1)return false;fn(k,dt,t);return true},
  ()=>{S.remove(o);o.traverse(m=>{if(m.material)m.material.dispose();if(m.geometry&&!m.geometry.userData.sh)m.geometry.dispose()})})}
// урон позже момента каста: временно возвращаем CTX кастера (свой набор «уже задетых» на каждый удар)
const withC=(c,fn)=>{if(!c)return;const s=CTX;CTX={o:c.o,dmg:c.dmg,hit:new Set()};try{fn()}finally{CTX=s}};
function area(c,x,z,r,mul,op){if(!c)return;const d=c.dmg*mul;
 forE((i,qx,qz)=>{if(Math.hypot(qx-x,qz-z)<r+(isB(i)?5:0)){eH(i,d);if(op&&op.st)stn(i,op.st);if(op&&op.up&&!isB(i))eUp(i,x,z,op.up)}});
 withC(c,()=>plT(q=>Math.hypot(q.x-x,q.z-z)<r,mul,x,z))}
const segD=(px,pz,a,b)=>{const abx=b.x-a.x,abz=b.z-a.z,t=Math.max(0,Math.min(1,((px-a.x)*abx+(pz-a.z)*abz)/(abx*abx+abz*abz||1)));return Math.hypot(px-a.x-abx*t,pz-a.z-abz*t)};
function line(c,a,b,w,mul,st){if(!c)return;const d=c.dmg*mul;
 forE((i,qx,qz)=>{if(segD(qx,qz,a,b)<w+(isB(i)?5:0)){eH(i,d);if(st)stn(i,st)}});
 withC(c,()=>plT(q=>segD(q.x,q.z,a,b)<w,mul,a.x,a.z))}
const cx=()=>{const c=CTX,o=CS(),p=CP().position.clone(),F=fwd();face(o,F);return{c,o,p,F,v:kv(o)}};
const heavy=o=>{const m=MO(o);if(m&&m.play)m.play('cast_heavy')};
const burst=(x,y,z,n,sp,cols,life,size)=>{for(let k=0;k<n;k++){const a=rnd()*PI*2,e=(rnd()-.3)*PI*.5,s=sp*(.4+rnd()*.6);emit(x,y,z,Math.cos(a)*Math.cos(e)*s,Math.sin(e)*s+2,Math.sin(a)*Math.cos(e)*s,life,cols[k%cols.length],size,-6)}};

// 1 · Удар кулаком: короткая ударная волна перед собой
function punch(){const{c,p,F,v}=cx(),x=p.x+F.x*5,z=p.z+F.z*5;
 const r=new T3.Mesh(RGW,gm(0xffffff,.9));r.position.set(x,3,z);r.lookAt(x+F.x,3,z+F.z);fxo(r,.3,k=>{r.scale.setScalar(1.2+k*4);r.material.opacity=.9*(1-k)});
 const s=new T3.Mesh(SPH,gm(0xffaa33,.8));s.position.set(x,3,z);fxo(s,.3,k=>{s.scale.setScalar(1+k*2.6);s.material.opacity=.8*(1-k)});
 for(let n=0;n<14;n++)emit(x,3,z,F.x*22+(rnd()-.5)*10,(rnd()-.5)*7,F.z*22+(rnd()-.5)*10,.35,n&1?0xffffff:0xffaa33,1.3,0);
 lite(x,3,z,0xffaa33,1.2);sBoomB(.2*v);area(c,x,z,5.5,.9,{st:.25})}

// 2 · Резиновый взрыв: рука вытягивается на 30, в конце — взрыв
function rubber(){const{c,p,F,v}=cx(),L=30,a=new V3(p.x+F.x*1.5,3,p.z+F.z*1.5),b=a.clone().addScaledVector(F,L);b.x=CL(b.x);b.z=CL(b.z);
 const arm=new T3.Mesh(shg(new T3.CylinderGeometry(.45,.45,1,10)),sm(0xe8b090,1));arm.quaternion.setFromUnitVectors(new V3(0,1,0),F);
 const fist=new T3.Mesh(SPH,sm(0x3a2a2a,1,0x220000));fist.scale.setScalar(1.3);let bm=0;
 fxo(fist,.26,k=>{fist.position.copy(a).lerp(b,k)});
 fxo(arm,.75,k=>{if(k<.35){const s=Math.max(.02,k/.35);arm.scale.set(1,s*L,1);arm.position.copy(a).addScaledVector(F,s*L/2)}
  else{if(!bm){bm=1;boom()}arm.scale.set(1,L*(1-(k-.35)/.65)+.02,1);arm.position.copy(a).addScaledVector(F,arm.scale.y/2)}});
 function boom(){const x=b.x,z=b.z,e=new T3.Mesh(SPH,gm(0xff4400,.9)),w=new T3.Mesh(RNG,gm(0xffaa00,.9));e.position.set(x,3,z);w.rotation.x=-PI/2;w.position.set(x,.4,z);
  fxo(e,.5,k=>{e.scale.setScalar(1+k*10);e.material.opacity=.9*(1-k)});fxo(w,.55,k=>{w.scale.setScalar(1+k*16);w.material.opacity=.9*(1-k)});
  burst(x,3,z,30,22,[0xff4400,0xffcc33,0xffffff],.6,1.6);lite(x,4,z,0xff6600,2.5);sBoomB(.6*v);area(c,x,z,10,1.6,{st:.5});line(c,a,b,2.5,.5)}}

// 3 · Красный Ястреб: огненный кулак летит вперёд и раскручивает огненный смерч
function hawk(){const{c,p,F,v}=cx(),s0=new V3(p.x+F.x*2,3,p.z+F.z*2),tg=new V3(CL(p.x+F.x*26),3,CL(p.z+F.z*26));
 const fb=new T3.Mesh(SPH,gm(0xff3300,.95));fxo(fb,.35,k=>{fb.position.copy(s0).lerp(tg,k);fb.scale.setScalar(1.4+k*1.6);emit(fb.position.x,3,fb.position.z,(rnd()-.5)*4,rnd()*4,(rnd()-.5)*4,.4,rnd()<.5?0xff3300:0xffaa00,1.6,2)});
 const G=new T3.Group(),rs=[];G.position.set(tg.x,0,tg.z);
 for(let i=0;i<8;i++){const r=new T3.Mesh(shg(new T3.TorusGeometry(2+i*1.1,.5,6,22)),gm(i&1?0xff4400:0xffaa00,.8));r.rotation.x=PI/2;r.position.y=1+i*2.5;G.add(r);rs.push(r)}
 let tk=0,first=1;
 fxo(G,2.2,(k,dt)=>{if(first){first=0;area(c,tg.x,tg.z,8,1.2,{st:.4});lite(tg.x,5,tg.z,0xff4400,2.5);sBoomB(.5*v)}
  G.rotation.y+=dt*9;const f=Math.sin(k*PI);G.scale.set(.6+k*1.4,.7+k*.6,.6+k*1.4);rs.forEach((r,i)=>{r.material.opacity=f*.85;r.rotation.z+=dt*(5+i)});
  for(let n=0;n<3;n++){const a=rnd()*PI*2,rr=2+rnd()*8;emit(tg.x+Math.cos(a)*rr,1+rnd()*16,tg.z+Math.sin(a)*rr,-Math.sin(a)*12,6+rnd()*6,Math.cos(a)*12,.5,rnd()<.5?0xff3300:0xffcc33,1.8,0)}
  if((tk+=dt)>.3){tk=0;area(c,tg.x,tg.z,9,.4)}},.35)}

// 4 · Обезьянья пушка: два хлопка-взрыва подряд
function ape(){const{c,p,F,v}=cx(),x=CL(p.x+F.x*14),z=CL(p.z+F.z*14);
 const d1=new T3.Mesh(SPH,gm(0xff5500,.85)),d2=new T3.Mesh(SPH,gm(0xff0022,.8));d1.position.set(x,3,z);d2.position.set(x,3,z);let h1=0,h2=0;
 fxo(d1,.6,k=>{if(!h1){h1=1;area(c,x,z,12,1.2,{st:.3});shock(x,z,0xff6600,14,.5);sBoomB(.5*v)}d1.scale.setScalar(1+k*12);d1.material.opacity=.85*(1-k)});
 fxo(d2,.7,k=>{if(!h2){h2=1;area(c,x,z,18,1.4,{up:1});shock(x,z,0xff0022,20,.6);burst(x,3,z,36,26,[0xff0022,0xff8800,0xffffff],.7,1.8);lite(x,4,z,0xff3300,3);sBoomB(.8*v)}
  d2.scale.setScalar(1+k*18);d2.material.opacity=.8*(1-k);d2.material.wireframe=k>.15},.35)}

// 5 · Тацумаки: вихрь вокруг себя, подбрасывает врагов
function tatsu(){const{c,p,v}=cx(),G=new T3.Group(),rb=[];G.position.set(p.x,0,p.z);
 for(let i=0;i<12;i++){const m=new T3.Mesh(shg(new T3.TorusGeometry(5+i*1.4,.4,6,26,PI*1.3)),gm(i&1?0x3ddc84:0xccffdd,.85));m.rotation.x=PI/2;m.rotation.z=i*.8;m.userData.y0=i*2.4;G.add(m);rb.push(m)}
 area(c,p.x,p.z,22,1.4,{up:1.3});lite(p.x,5,p.z,0x3ddc84,2);sBoomB(.4*v);let tk=0;
 fxo(G,2.6,(k,dt)=>{G.rotation.y+=dt*7;const f=Math.sin(k*PI);rb.forEach(m=>{m.position.y=(m.userData.y0+k*22)%30;m.material.opacity=f*.85});G.scale.setScalar(1+k*.3);
  for(let n=0;n<3;n++){const a=rnd()*PI*2,r=4+rnd()*16;emit(p.x+Math.cos(a)*r,rnd()*3,p.z+Math.sin(a)*r,-Math.sin(a)*16,10+rnd()*8,Math.cos(a)*16,.6,n&1?0x3ddc84:0xffffff,1.5,0)}
  if((tk+=dt)>.5){tk=0;area(c,p.x,p.z,22,.3)}})}

// 6 · Дзюкай Котан (полуульта): из земли лезут гигантские корни на большой площади
function jukai(){const{c,p,F,v}=cx(),x=CL(p.x+F.x*40),z=CL(p.z+F.z*40),G=new T3.Group(),rs=[];G.position.set(x,0,z);heavy(CS());
 for(let i=0;i<16;i++){const an=i/16*PI*2+(rnd()-.5)*.3,pts=[];for(let s=0;s<=7;s++){const d=s*5.3,wv=Math.sin(s*1.2+i)*4,y=Math.abs(Math.sin(s*.9+i))*4.5;
   pts.push(new V3(Math.cos(an)*d-Math.sin(an)*wv,y,Math.sin(an)*d+Math.cos(an)*wv))}
  const m=new T3.Mesh(new T3.TubeGeometry(new T3.CatmullRomCurve3(pts),22,1+rnd()*.8,6,false),sm(i&1?0x3a2414:0x2a180c,1,0x060200));G.add(m);rs.push(m)}
 let tk=0,hit=0;
 fxo(G,4.5,(k,dt,t)=>{const gr=Math.min(1,k/.22),fd=k>.82?(1-k)/.18:1;rs.forEach((r,i)=>{r.scale.setScalar(Math.max(.01,gr));r.position.y=-3+gr*3+Math.sin(t*3+i)*.6;r.material.opacity=fd});
  if(!hit&&t>.4){hit=1;area(c,x,z,40,2.2,{st:2.5});sBoomB(.7*v);lite(x,5,z,0x88ff44,2)}
  if(t<1)for(let n=0;n<4;n++){const a=rnd()*PI*2,r=rnd()*38;emit(x+Math.cos(a)*r,.5,z+Math.sin(a)*r,0,6+rnd()*6,0,.7,n&1?0x6b4a2a:0x88cc44,2,-10)}
  if(t>.4&&(tk+=dt)>.6){tk=0;area(c,x,z,40,.25)}})}

// 7 · УЛЬТА «Джаджанкен: Камень»: заряд 2.5 с (жёлтая аура, чёрно-оранжевое ядро, молнии) → удар → купол-взрыв почти на всю карту
function jajan(){const{c,o,p,F,v}=cx(),mine=o===ME,TC=2.5,cp=new V3(p.x+F.x*2.5,4,p.z+F.z*2.5);if(mine)ME.hold=Math.max(ME.hold||0,TC+.2);
 const G=new T3.Group();
 const au=new T3.Mesh(CYO,gm(0xffee22,.5));au.position.set(p.x,0,p.z);G.add(au);
 const core=new T3.Mesh(SPH,gm(0xffdd00,.95));core.position.copy(cp);G.add(core);
 const inner=new T3.Mesh(SPH,new T3.MeshBasicMaterial({color:0x080404}));inner.position.copy(cp);G.add(inner);
 const dome=new T3.Mesh(HEMI,gm(0xff6600,.85));dome.position.set(p.x,0,p.z);dome.visible=false;G.add(dome);
 const ring=new T3.Mesh(RNG,gm(0xffaa00,.95));ring.rotation.x=-PI/2;ring.position.set(p.x,1,p.z);ring.visible=false;G.add(ring);
 let bt=0,hv=0,b1=0,b2=0;
 fxo(G,TC+2.4,(k,dt,t)=>{
  if(t<TC){const q=t/TC;au.scale.set(2.5+q*14,6+q*6,2.5+q*14);au.material.opacity=.45*(1-q*.4);au.rotation.y+=dt*8;
   core.scale.setScalar(.5+q*2.8);core.material.color.setHex(q<.5?0xffdd00:0xff5500);inner.visible=q>.45;inner.scale.setScalar(Math.max(.01,(q-.45)*2.4));
   for(let n=0;n<3;n++){const a=rnd()*PI*2,e=rnd()*PI,r=10+rnd()*8,sx=cp.x+Math.cos(a)*Math.sin(e)*r,sy=cp.y+Math.cos(e)*r*.6,sz=cp.z+Math.sin(a)*Math.sin(e)*r;emit(sx,sy,sz,(cp.x-sx)*2.5,(cp.y-sy)*2.5,(cp.z-sz)*2.5,.4,n&1?0xffee22:0xff6600,1.4,0)}
   if(q>.4&&(bt+=dt)>.08){bt=0;for(let n=0;n<3;n++)bolt(cp,new V3(cp.x+(rnd()-.5)*24,cp.y+(rnd()-.5)*14,cp.z+(rnd()-.5)*24),n&1?0xff6600:0xffffff,.12,1.5)}
   lite(cp.x,cp.y,cp.z,q<.5?0xffdd00:0xff5500,1+q*2);
   if(!hv&&t>TC-.55){hv=1;heavy(o)}}
  else{const b=(t-TC)/2.4;au.visible=core.visible=inner.visible=false;dome.visible=ring.visible=true;
   if(!b1){b1=1;flash(.5);sBoomB(1.2*v);area(c,p.x,p.z,140,6,{up:1.6});burst(p.x,4,p.z,60,40,[0xff6600,0xffcc33,0xffffff,0x330000],1,2.4)}
   if(!b2&&b>.3){b2=1;area(c,p.x,p.z,285,1.2)}
   dome.scale.set(1+b*285,1+b*120,1+b*285);dome.material.opacity=.8*(1-b);ring.scale.setScalar(1+b*290);ring.material.opacity=.95*(1-b);lite(p.x,10,p.z,0xff6600,3*(1-b))}})}

// 8 · Молот Глейпнир: гигантский молот падает с неба, чёрно-красные молнии и волна по области
function gleip(){const{c,p,F,v}=cx(),x=CL(p.x+F.x*22),z=CL(p.z+F.z*22),H=new T3.Group();heavy(CS());
 const hm=sm(0x2a0a0e,1,0x3a0006),hd=new T3.Mesh(shg(new T3.BoxGeometry(10,7,14)),hm),hl=new T3.Mesh(shg(new T3.CylinderGeometry(.9,1.1,18,10)),sm(0x1a1a1a,1));hl.position.y=12.5;
 const gw=new T3.Mesh(shg(new T3.BoxGeometry(10.6,7.6,14.6)),gm(0xff0022,.5));gw.material.wireframe=true;H.add(hd,hl,gw);H.position.set(x,60,z);H.rotation.y=Math.atan2(F.x,F.z);
 let hit=0,bt=0;
 fxo(H,2.2,(k,dt,t)=>{if(t<.45){const s=t/.45;H.position.y=60-56.5*s*s;emit(x+(rnd()-.5)*8,H.position.y+4,z+(rnd()-.5)*8,0,20,0,.3,0xff0022,1.5,0)}
  else{H.position.y=3.5;if(!hit){hit=1;impact()}if(t>1.6){const f=(2.2-t)/.6;hm.opacity=f;hl.material.opacity=f;gw.material.opacity=.5*f}
   if(t<1.3&&(bt+=dt)>.1){bt=0;for(let n=0;n<5;n++){const a=rnd()*PI*2,r=10+rnd()*60;bolt(new V3(x,8,z),new V3(x+Math.cos(a)*r,rnd()*14,z+Math.sin(a)*r),n&1?0xcc0011:0xff6666,.15,3)}}}});
 function impact(){const w=new T3.Mesh(RNG,gm(0xcc0011,.95)),dm=new T3.Mesh(HEMI,gm(0x660008,.6));w.rotation.x=-PI/2;w.position.set(x,1.2,z);dm.position.set(x,0,z);
  fxo(w,1.2,k=>{w.scale.setScalar(1+k*75);w.material.opacity=.95*(1-k)});fxo(dm,1,k=>{dm.scale.setScalar(1+k*60);dm.material.opacity=.6*(1-k)});
  shock(x,z,0xff0022,30,.6);burst(x,2,z,40,30,[0xcc0011,0xff6666,0x220000],.8,2);flash(.35);lite(x,6,z,0xff0022,3);sBoomB(1*v);
  area(c,x,z,32,3.2,{st:1.5});area(c,x,z,70,.9,{st:1})}}

// 9 · Рывок: вспышка и рывок на 24 вперёд, задевает по пути
function soru(){const{c,o,p,F}=cx(),g=CS().g,b=new V3(CL(p.x+F.x*24),0,CL(p.z+F.z*24));
 const m=new T3.Mesh(CYO,gm(0x3ddc84,.8));m.position.set(p.x,0,p.z);fxo(m,.35,k=>{m.scale.set(2+k*6,7,2+k*6);m.material.opacity=.8*(1-k)});
 let t=0;fx.push(dt=>{t+=dt;const k=Math.min(1,t/.18);g.position.x=p.x+(b.x-p.x)*k;g.position.z=p.z+(b.z-p.z)*k;
  for(let n=0;n<4;n++)emit(g.position.x+(rnd()-.5)*2,1+rnd()*5,g.position.z+(rnd()-.5)*2,0,1,0,.4,n&1?0x3ddc84:0xffffff,1.4,0);return k<1});
 line(c,p,b,4,1)}

return{sp:[punch,rubber,hawk,ape,tatsu,jukai,jajan,gleip,soru],
 IC:['👊','💥','🔥','💣','🌪️','🌿','☄️','🔨','⚡'],
 NM:['Удар кулаком','Резиновый взрыв','Красный Ястреб','Обезьянья пушка','Тацумаки','Дзюкай Котан','Джаджанкен: Камень','Молот Глейпнир','Рывок'],
 cdm:[1,5,9,11,14,30,180,35,6],dur:[.4,.9,2.6,1.2,2.6,4.5,4.9,2.2,.3]}})();
CLS.push({sp:[...ANC.sp,wallSh,domeSh],cdm:[...ANC.cdm,6,5.2],dur:[...ANC.dur,3.4,2.5],
 ic:CLS[0].ic.map((x,i)=>i<9?ANC.IC[i]:x),nu:CLS[0].nu.map((x,i)=>i<9?(i==6?'7/R':String(i+1)):x),
 tx:CLS[0].tx.map((x,i)=>i<9?(i+1)+' · '+ANC.NM[i]:x),nm:CLS[0].nm.map((x,i)=>i<9?ANC.IC[i]+' '+ANC.NM[i]+(i==6?' (ульта)':''):x)});
