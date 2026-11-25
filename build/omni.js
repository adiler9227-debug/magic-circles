// ===== 7-Й ГЕРОЙ «УЛЬТИМЕЙТ» (класс 6): все умения всех героев, по стойкам =====
// Стойка = набор умений одного героя (Маг, Мечник, Ниндзя, Коробас, Блочный, Предок), переключение — T или кнопка 🔄.
// Эффекты Ультимейта: масштаб 0.45 от оригинала (вокруг героя), оттенок чуть сдвинут, урон ×0.45, ульты — откат 60 с.
// Как работает масштаб: на время каста в CTX кладётся os={s,px,pz,G}; движок восстанавливает CTX и в отложенных
// эффектах (fx.push), поэтому всё, что эффект добавляет в сцену, попадает в группу G (масштаб вокруг героя),
// а частицы/дым/камни/вспышки пересчитываются обёртками.
const OMNI=(function(){
const T3=THREE,SRC=[0,1,2,3,4,5],NAMES=['Маг','Мечник','Ниндзя','Коробас','Блочный воин','Предок'],SC=.45,HUE=.09,ULTCD=60;
let ST=0;const CDS=[0,1,2,3,4,5].map(()=>new Array(11).fill(0)),GS=[];
const os=()=>CTX&&CTX.os;
// ---------- цвет ----------
const hueC=new Map();
const hh=h=>{if(typeof h!=='number')return h;let r=hueC.get(h);if(r==null){const c=new T3.Color(h);c.offsetHSL(HUE,.08,0);r=c.getHex();hueC.set(h,r)}return r};
const mats=m=>m.material?(Array.isArray(m.material)?m.material:[m.material]):[];
function tint(o){o.traverse(m=>{for(const mt of mats(m)){const u=mt.userData;if(u.omN){u.omN++;continue}u.omN=1;const sv=u.omSv=[];
  if(mt.color&&mt.color.isColor){sv.push([mt.color,mt.color.getHex()]);mt.color.offsetHSL(HUE,.08,0)}
  if(mt.uniforms)for(const k in mt.uniforms){const v=mt.uniforms[k]&&mt.uniforms[k].value;if(v&&v.isColor){sv.push([v,v.getHex()]);v.offsetHSL(HUE,.08,0)}}}})}
function untint(o){o.traverse(m=>{for(const mt of mats(m)){const u=mt.userData;if(!u.omN)continue;if(--u.omN<=0){(u.omSv||[]).forEach(([c,h])=>c.setHex(h));delete u.omN;delete u.omSv}}})}
// ---------- сцена: во время каста Ультимейта всё новое — в уменьшенную группу ----------
const _add=S.add.bind(S),_rem=S.remove.bind(S);
S.add=function(...a){const c=os();if(!c)return _add(...a);for(const o of a){if(!o)continue;if(o.isLight||o.isCamera){_add(o);continue}tint(o);o.userData.omT=1;c.G.add(o)}return S};
S.remove=function(...a){for(const o of a){if(!o)continue;if(o.userData&&o.userData.omT){untint(o);delete o.userData.omT}if(o.parent&&o.parent!==S)o.parent.remove(o);else _rem(o)}return S};
setInterval(()=>{const t=performance.now();for(let i=GS.length-1;i>=0;i--){const g=GS[i];if(!g.children.length&&t-g.userData.t0>4000){_rem(g);GS.splice(i,1)}}},3000);
// частицы движка
const _emit=emit;
emit=function(x,y,z,vx,vy,vz,life,h,size,g){const c=os();if(c){x=c.px+(x-c.px)*c.s;z=c.pz+(z-c.pz)*c.s;y*=c.s;vx*=c.s;vy*=c.s;vz*=c.s;size=(size==null?1:size)*c.s;g=(g||0)*c.s;h=hh(h)}return _emit(x,y,z,vx,vy,vz,life,h,size,g)};
// дым, камни, вспышки, руны (UFX и FX3 объявлены позже — обёртки ставятся при первом касте)
let wrapped=0;
function wrapAll(){if(wrapped)return;wrapped=1;
 const W=(obj,name,fn)=>{try{const f=obj&&obj[name];if(typeof f!=='function')return;obj[name]=function(...a){const c=os();return c?f.apply(this,fn(c,a)):f.apply(this,a)}}catch(e){}};
 const mp=(c,x,z)=>[c.px+(x-c.px)*c.s,c.pz+(z-c.pz)*c.s],sc=(c,v)=>v==null?v:v*c.s;
 try{W(UFX,'puff',(c,a)=>{const[x,z]=mp(c,a[0],a[2]);return[x,a[1]*c.s,z,a[3]*c.s,a[4]*c.s,a[5]*c.s,a[6]*c.s,a[7],hh(a[8]),sc(c,a[9]),sc(c,a[10]),a[11]]});
  W(UFX,'rock',(c,a)=>{const[x,z]=mp(c,a[0],a[2]);return[x,a[1]*c.s,z,a[3]*c.s,a[4]*c.s,a[5]*c.s,a[6]*c.s,a[7],a[8],a[9]]});
  W(UFX,'burst',(c,a)=>{const[x,z]=mp(c,a[0],a[1]);return[x,z,a[2],a[3]*c.s,a[4]*c.s,a[5]*c.s,a[6],a[7]]});
  W(UFX,'dustRing',(c,a)=>{const[x,z]=mp(c,a[0],a[1]);return[x,z,a[2],a[3]*c.s,a[4]*c.s,hh(a[5]),a[6],sc(c,a[7])]});
  W(UFX,'column',(c,a)=>{const[x,z]=mp(c,a[0],a[1]);return[x,z,a[2],a[3]*c.s,a[4]*c.s,hh(a[5]),a[6],sc(c,a[7])]});
  W(UFX,'levitate',(c,a)=>{const[x,z]=mp(c,a[0],a[1]);return[x,z,a[2],a[3]*c.s,a[4]*c.s,a[5]*c.s,a[6]*c.s,a[7]*c.s,a[8]]});
  W(UFX,'release',(c,a)=>[a[0],a[1]*c.s,a[2]*c.s,a[3]])}catch(e){}
 try{W(FX3,'star',(c,a)=>{const[x,z]=mp(c,a[0],a[2]);return[x,a[1]*c.s,z,hh(a[3]),a[4]*c.s,a[5]]});
  W(FX3,'seal',(c,a)=>{const[x,z]=mp(c,a[0],a[2]);return[x,a[1]*c.s,z,a[3]*c.s,hh(a[4]),a[5],a[6],a[7]]});
  W(FX3,'sparks',(c,a)=>{const[x,z]=mp(c,a[0],a[2]);return[x,a[1]*c.s,z,a[3],a[4]*c.s,a[5]*c.s,hh(a[6]),a[7]]});
  W(FX3,'gflash',(c,a)=>{const[x,z]=mp(c,a[0],a[1]);return[x,z,a[2]*c.s,hh(a[3]),a[4]]})}catch(e){}}
// ---------- каст: умение героя текущей стойки, в уменьшенном масштабе ----------
function cast(i){const c=CTX;if(!c||!c.o)return;const o=c.o,st=o===ME?ST:(o.st|0),cl=SRC[st]||0,K=CLS[cl],fn=K&&K.sp[i];if(typeof fn!=='function')return;wrapAll();
 const p=o.g.position,G=new T3.Group();G.position.set(p.x*(1-SC),0,p.z*(1-SC));G.scale.setScalar(SC);G.userData.t0=performance.now();_add(G);GS.push(G);
 c.os={s:SC,px:p.x,pz:p.z,G};
 const k0=o.cl,c0=cls,mine=o===ME;o.cl=cl;if(mine)cls=cl;                // умения читают класс кастера
 try{fn()}catch(e){console.error('omni',cl,i,e)}finally{o.cl=k0;if(mine)cls=c0}}
// ---------- стойки, кнопки, откаты ----------
const U={sp:[...Array(11)].map((_,i)=>()=>cast(i)),cdm:new Array(11).fill(1),dur:new Array(11).fill(1),ic:new Array(11).fill(''),nu:new Array(11).fill(''),tx:new Array(11).fill(''),nm:new Array(11).fill('')};
CLS.push(U);   // CLS[6]
function apply(){const c=SRC[ST],K=CLS[c];for(let i=0;i<11;i++){const ult=i===ULTS[c];U.cdm[i]=ult?ULTCD:K.cdm[i];U.dur[i]=K.dur[i];U.ic[i]=K.ic[i];U.nu[i]=K.nu[i];
  U.tx[i]=K.tx[i]?K.tx[i]+(ult?' ✦':''):'';U.nm[i]=K.nm[i]}
 if(cls===6)btn.forEach((b,i)=>{b.querySelector('.ic').textContent=U.ic[i];b.querySelector('.nm').textContent=U.nu[i];b.querySelector('.tx').textContent=U.tx[i];b.style.display=U.tx[i]?'':'none'})}
function onClass(c){document.body.classList.toggle('cls6',c===6);if(c===6){for(let i=0;i<11;i++)cd[i]=CDS[ST][i];apply()}else btn.forEach(b=>b.style.display='')}
function next(){if(cls!==6)return;for(let i=0;i<11;i++)CDS[ST][i]=cd[i];ST=(ST+1)%6;for(let i=0;i<11;i++)cd[i]=CDS[ST][i];apply();
 try{toastE.textContent='🔄 Стойка: '+NAMES[ST];toastE.style.opacity=1;clearTimeout(toastT);toastT=setTimeout(()=>toastE.style.opacity=0,1100)}catch(e){}
 try{netSend({t:'s',x:CP().position.x,z:CP().position.z,y:yaw,r:P.rotation.y,h:ME.hp,m:ME.maxhp,l:ME.lvl,v:0,d:ME.dead>0?1:0,c:cls,k:ST,ds:ME.dash?1:0})}catch(e){}}
try{const b=document.getElementById('ub');if(b)b.onclick=next}catch(e){}
// ---------- облик: мечник из .glb в фиолетово-золотом + 6 сфер героев по кругу ----------
function model(){const o=makeSaint(),T=THREE,g=o.g,orbs=new T.Group(),COL=[0xc080ff,0xffd060,0x66ddff,0xff5ad8,0xa040ff,0x3ddc84];let done=0;
 const ms=COL.map(c=>{const m=new T.Mesh(new T.SphereGeometry(.28,12,10),new T.MeshBasicMaterial({color:c,transparent:true,opacity:.95,blending:T.AdditiveBlending,depthWrite:false}));orbs.add(m);return m});
 orbs.position.y=3.6;g.add(orbs);const u0=o.u;
 if(!o.hand)o.hand=()=>{g.updateMatrixWorld();return g.localToWorld(new T.Vector3(-1.3,3.4,1.3))};   // точка правой руки (нужна умениям ниндзя)
 o.u=function(t,mv){u0.apply(o,arguments);orbs.rotation.y=t*1.6;ms.forEach((m,i)=>{const a=i/6*Math.PI*2;m.position.set(Math.cos(a)*2.3,Math.sin(t*2+i)*.35,Math.sin(a)*2.3);m.scale.setScalar(1+Math.sin(t*4+i)*.15)});
  if(!done){let sk=null;g.traverse(m=>{if(m.isSkinnedMesh)sk=m});if(sk){done=1;g.traverse(m=>{if(m.isSkinnedMesh&&m.material){m.material=m.material.clone();m.material.color.setRGB(.82,.72,1.08);if(m.material.emissive)m.material.emissive.setHex(0x160628)}})}}};
 return o}
return{cast,apply,onClass,next,model,st:()=>ST,NAMES}})();
