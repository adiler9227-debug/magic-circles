// ===== FX3-BEGIN: графика v4 — красивые ударные волны, столбы света, искры-звёзды, вспышки попаданий, руны под героями, ёлки, горы, цвет =====
// Тайминги умений и звук не тронуты: меняются только общие «кирпичики» (shock, pillar, kill, castFX) и окружение.
const FX3=(()=>{const T=THREE,lv=()=>GFX.tier===0?0:isTouch?1:2,lo=()=>lv()<2;
 const NZ='float h1(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float nz(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h1(i),h1(i+vec2(1,0)),f.x),mix(h1(i+vec2(0,1)),h1(i+vec2(1,1)),f.x),f.y);}\n';
 const noSh=m=>{m.userData.noShadow=true;m.frustumCulled=false;return m};
 // ---------- текстуры: мягкое свечение, звезда-вспышка, рунный круг ----------
 const cvs=n=>{const c=document.createElement('canvas');c.width=c.height=n;return c};
 const glowT=(()=>{const c=cvs(128),x=c.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.25,'rgba(255,255,255,.55)');g.addColorStop(.6,'rgba(255,255,255,.12)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,128,128);return new T.CanvasTexture(c)})();
 const starT=(()=>{const c=cvs(128),x=c.getContext('2d');x.globalCompositeOperation='lighter';
  let g=x.createRadialGradient(64,64,0,64,64,40);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.3,'rgba(255,255,255,.45)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,128,128);
  for(const[a,L,w]of[[0,62,5],[Math.PI/2,62,5],[Math.PI/4,34,3],[-Math.PI/4,34,3]]){x.save();x.translate(64,64);x.rotate(a);g=x.createLinearGradient(-L,0,L,0);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;
   x.beginPath();x.moveTo(-L,0);x.quadraticCurveTo(0,-w,L,0);x.quadraticCurveTo(0,w,-L,0);x.fill();x.restore()}
  return new T.CanvasTexture(c)})();
 const runeT=(()=>{const N=512,c=cvs(N),x=c.getContext('2d'),C0=N/2;let sd=23;const rr=()=>(sd=(sd*16807)%2147483647)/2147483647;
  x.strokeStyle='#fff';x.fillStyle='#fff';x.lineCap='round';x.shadowColor='#fff';x.shadowBlur=8;
  const ring=(r,w)=>{x.lineWidth=w;x.beginPath();x.arc(C0,C0,r*C0,0,PI2);x.stroke()};ring(.95,5);ring(.88,2);ring(.62,3);ring(.2,3);
  for(const off of[0,Math.PI/5]){x.lineWidth=3;x.beginPath();for(let k=0;k<=5;k++){const a=off+k*PI2/5*2,r=.62*C0;k?x.lineTo(C0+Math.cos(a)*r,C0+Math.sin(a)*r):x.moveTo(C0+Math.cos(a)*r,C0+Math.sin(a)*r)}x.stroke()}
  for(let i=0;i<22;i++){const a=i/22*PI2,r=.75*C0;x.save();x.translate(C0+Math.cos(a)*r,C0+Math.sin(a)*r);x.rotate(a+Math.PI/2);x.lineWidth=3;x.beginPath();for(let k=0;k<4;k++){const px=(rr()-.5)*22,py=(rr()-.5)*30;k?x.lineTo(px,py):x.moveTo(px,py)}x.stroke();x.restore()}
  for(let i=0;i<10;i++){const a=i/10*PI2;x.lineWidth=2;x.beginPath();x.moveTo(C0+Math.cos(a)*.2*C0,C0+Math.sin(a)*.2*C0);x.lineTo(C0+Math.cos(a)*.36*C0,C0+Math.sin(a)*.36*C0);x.stroke()}
  const t=new T.CanvasTexture(c);t.anisotropy=Math.min(8,R.capabilities.getMaxAnisotropy());return t})();
 const flat=(tex,c,o,s)=>{const m=noSh(new T.Mesh(QG,new T.MeshBasicMaterial({map:tex,color:c,transparent:true,opacity:o,blending:AB,depthWrite:false})));m.rotation.x=-Math.PI/2;m.scale.set(s,s,1);return m};

 // ---------- вспышка экрана: мягкая, не «выбеливает» картинку ----------
 try{fl.style.background='radial-gradient(circle at 50% 55%,rgba(255,255,255,.16),rgba(255,255,255,.46))'}catch(e){}
 // ---------- цвет: яркие эффекты сохраняют свой цвет, а не уходят в белое; чуть глубже тени ----------
 try{const mc=PFX.comp,a='c=mix(c,.86+.14*(1.-exp(-(c-.86)/.14)),step(vec3(.86),c));';
  if(mc&&mc.fragmentShader.includes(a)){mc.fragmentShader=mc.fragmentShader.replace(a,
   '{float m=max(c.r,max(c.g,c.b));if(m>.72){float n=.72+.28*(1.-exp(-(m-.72)/.5));c*=n/m;c=mix(c,vec3(n),smoothstep(1.3,5.,m)*.5);}}'+
   '{float l2=dot(c,vec3(.299,.587,.114));c*=mix(vec3(.93,.95,1.06),vec3(1.05,1.,.96),smoothstep(.08,.75,l2));c=mix(c,c*c*(3.-2.*c),.22*gr);}');
   mc.uniforms.bs.value=.82;mc.needsUpdate=true}}catch(e){console.error('fx3 grade',e)}
 // ---------- свет: больше объёма (лунный свет сильнее, заливка слабее) ----------
 try{const hemi=S.children.find(o=>o.isHemisphereLight);if(hemi)hemi.intensity=.84;GFX.sun.intensity=1.75;GFX.sun.color.set(0xe4d8ff)}catch(e){}

 // ---------- частицы: искры-звёздочки (крестообразный блик у крупных частиц) ----------
 PM.fragmentShader='varying vec3 v;void main(){vec2 p=gl_PointCoord-.5;float d=length(p)*2.;if(d>1.)discard;float f=1.-d;float L=max(v.r,max(v.g,v.b));'+
  'float st=max(0.,1.-abs(p.x)*11.)*max(0.,1.-abs(p.y)*2.1)+max(0.,1.-abs(p.y)*11.)*max(0.,1.-abs(p.x)*2.1);'+
  'vec3 c=v*f*f*1.5+vec3(pow(f,7.))*L*.85+(v+vec3(L*.35))*st*f*.75;gl_FragColor=vec4(c,1.);}';PM.needsUpdate=true;

 // ---------- ударная волна: огненный шлейф, лучи-прожилки, свечение, вспышка в центре, пыль ----------
 const VQ='varying vec2 u;void main(){u=uv*2.-1.;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';
 const SHF=NZ+`varying vec2 u;uniform vec3 c;uniform float o,k,sd;
void main(){float L=length(u),r=L/.78;if(r>1.28)discard;vec2 d=u/max(L,1e-4);
 float n=nz(d*4.+sd+r*2.-k*3.),n2=nz(d*17.+sd*3.);
 float tr=smoothstep(.4,1.,r)*step(r,1.);tr*=tr*(.25+.75*n);
 float sk=pow(n2,4.)*smoothstep(.15,1.,r)*step(r,1.02)*1.5;
 float gl=smoothstep(1.28,1.,r)*step(1.,r);gl*=gl*.55;
 float ed=smoothstep(.05,0.,abs(r-1.));
 float core=exp(-r*r*5.)*max(0.,1.-k*4.)*1.4;
 float v=(tr*.6+sk*.55+gl+ed*.8)*o+core;
 gl_FragColor=vec4(mix(c,vec3(1.),clamp(ed*.55+core*.5+sk*.25,0.,1.))*v,1.);}`;
 let nSh=0,spd=0,spdCool=0;
 {const _s=shock;shock=function(x,z,c,Rr,Tt){const r=_s.apply(this,arguments);try{
   Tt=Tt||.5;const L=lv();if(Rr>=16)impact(x,z,Math.min(Rr*.5,26),c);if(!L||nSh>(L>1?26:7)||Rr<(L>1?12:20))return r;nSh++;
   const mat=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:AB,uniforms:{c:{value:new T.Color(c)},o:{value:1},k:{value:0},sd:{value:rnd()*50}},vertexShader:VQ,fragmentShader:SHF});
   const m=noSh(new T.Mesh(QG,mat));m.rotation.x=-Math.PI/2;m.position.set(x,.34,z);m.scale.setScalar(.01);S.add(m);let t=0;
   fx.push(dt=>{t+=dt;const k=Math.min(1,t/Tt),s=Math.max(.01,Rr*Math.sqrt(k))/.78;m.scale.set(s,s,1);mat.uniforms.k.value=k;mat.uniforms.o.value=Math.pow(1-k,1.3);return k<1},()=>{nSh--;S.remove(m);mat.dispose()});
   if(Rr>=14){const n=Math.min(lo()?16:44,Rr|0),v=Rr/Tt*.55;for(let i=0;i<n;i++){const a=rnd()*PI2,q=.6+rnd()*.6;emit(x+Math.cos(a)*2,.4,z+Math.sin(a)*2,Math.cos(a)*v*q,2+rnd()*9,Math.sin(a)*v*q,.5+rnd()*.6,i&3?c:0xffffff,i&1?2.6:1.5,-9)}}
   if(Rr>=40&&spdCool<=0){const p=CP().position,dd=Math.hypot(p.x-x,p.z-z);if(dd<Rr*1.6+30){spd=1;spdCool=.9;SL.style.transform='rotate('+(rnd()*360|0)+'deg) scale(1.6)'}}
  }catch(e){console.error('fx3 shock',e)}return r}}

 // ---------- столб света: бегущие вверх потоки энергии, белое ядро, сияние у основания, искры ----------
 const PV='varying vec3 n,v;varying vec2 q;void main(){q=uv;n=normalize(normalMatrix*normal);vec4 m=modelViewMatrix*vec4(position,1.);v=-m.xyz;gl_Position=projectionMatrix*m;}';
 const PF=NZ+`varying vec3 n,v;varying vec2 q;uniform vec3 c;uniform float o,t,hh;
void main(){float f=abs(dot(normalize(n),normalize(v))),core=pow(f,2.5),a=q.x*6.2832;
 float s=nz(vec2(cos(a)*2.8+5.,sin(a)*2.8+q.y*hh*.22-t*5.)),s2=s*s*(3.-2.*s);
 float top=smoothstep(1.,.5,q.y),base=smoothstep(.16,0.,q.y);
 float al=(core*(.7+.55*s2)+pow(s,3.)*f*1.3)*top+base*f*.8;
 gl_FragColor=vec4(mix(c,vec3(1.),clamp(core*core*.75+base*.4,0.,1.))*al*o,1.);}`;
 let nPl=0;
 {const _p=pillar;pillar=function(x,z,c,h,w,Tt){if(!lv()||nPl>(lo()?9:22))return _p.apply(this,arguments);try{nPl++;Tt=Tt||1;
   const mat=new T.ShaderMaterial({transparent:true,depthWrite:false,side:2,blending:AB,uniforms:{c:{value:new T.Color(c)},o:{value:1},t:{value:rnd()*9},hh:{value:h}},vertexShader:PV,fragmentShader:PF});
   const m=noSh(new T.Mesh(PCG,mat)),g=flat(glowT,c,.9,w*3.4);m.position.set(x,0,z);g.position.set(x,.3,z);S.add(m,g);let t=0;
   fx.push(dt=>{t+=dt;const k=Math.min(1,t/Tt),q=w*(1.15-k*.65)*Math.min(1,t/.08+.2);m.scale.set(q,h*Math.min(1,.35+t/.12),q);mat.uniforms.t.value+=dt;const o=Math.pow(1-k,.8);mat.uniforms.o.value=.95*o;g.material.opacity=.9*o;g.scale.setScalar(w*(3.4+k*1.5));
    if(rnd()<.6){const a=rnd()*PI2;emit(x+Math.cos(a)*q,rnd()*h*.3,z+Math.sin(a)*q,-Math.sin(a)*5,10+rnd()*16,Math.cos(a)*5,.6,rnd()<.4?0xffffff:c,1.7,0)}
    return k<1},()=>{nPl--;S.remove(m,g);mat.dispose();g.material.dispose()})}catch(e){console.error('fx3 pillar',e);return _p.apply(this,arguments)}}}

 // ---------- вспышки-звёзды при попадании (один общий объект, до 48 одновременно) ----------
 const NH=48,HM=noSh(new T.InstancedMesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:starT,transparent:true,blending:AB,depthWrite:false,depthTest:false}),NH)),HL=[],_m=new T.Matrix4(),_p=new T.Vector3(),_s=new T.Vector3(),_c=new T.Color(),_q=new T.Quaternion(),_z=new T.Vector3(0,0,1);
 for(let i=0;i<NH;i++){HL.push({t:0,T:0,x:0,y:0,z:0,s:0,r:0,c:0});_m.makeScale(0,0,0);HM.setMatrixAt(i,_m);HM.setColorAt(i,_c.set(0))}HM.renderOrder=20;S.add(HM);let hi=0,hitN=0;
 function star(x,y,z,c,s,life){const h=HL[hi];hi=(hi+1)%NH;h.t=h.T=life||.22;h.x=x;h.y=y;h.z=z;h.s=s;h.c=c;h.r=rnd()*PI2}
 {const _k=kill;kill=function(i,rem){const was=al[i],x=ex[i],z=ez[i];const r=_k.apply(this,arguments);
   try{if(was&&!al[i]&&hitN<[2,6,12][lv()]){hitN++;const c=CCOL[(CTX&&CTX.o?CTX.o.cl:cls)||0]||0xffffff;star(x,1.6,z,c,5+rnd()*3,.24);
    for(let k=0;k<5;k++){const a=rnd()*PI2,sp=8+rnd()*14;emit(x,1.2,z,Math.cos(a)*sp,6+rnd()*12,Math.sin(a)*sp,.35+rnd()*.3,k&1?0xffffff:c,1.3,-26)}
    emit(x,1,z,(rnd()-.5)*1.5,5+rnd()*3,(rnd()-.5)*1.5,1.1,c,2.6,2)}}catch(e){}return r}}

 // ---------- место попадания: трещины в цвет умения, осколки камня, кольцо пыли ----------
 const IMP=[];let nCr=0,tt=0,lastImp=-9;
 function impact(x,z,Rd,c){const L=lv();if(!L||Rd<8||tt-lastImp<(L>1?.12:.35))return;
  for(let i=IMP.length-1;i>=0;i--){const m=IMP[i];if(tt-m.t>2.5){IMP.splice(i,1);continue}if(Math.hypot(m.x-x,m.z-z)<Math.max(m.R,Rd)*.6)return}
  IMP.push({x,z,R:Rd,t:tt});lastImp=tt;
  if(nCr<(L>1?5:2)){nCr++;const cr=UFX.cracks(x,z,Rd,c),life=2.8;UFX.run(life,t=>{cr.set(Math.min(1,t/.16),Math.max(0,1.35-t*.85),t>life-1?Math.max(0,life-t):1)},()=>{nCr--;cr.kill()})}
  UFX.burst(x,z,Math.min(L>1?12:8,3+Rd*.3),Rd*.45+6,10+Rd*.25,.32+Rd*.012,1.8);
  if(!(window.FX3ND>performance.now()))UFX.dustRing(x,z,L>1?8:6,Rd*.5+5,(L>1?3:2.2)+Rd*.1,0x6a6480,L>1?1.4:1.1,1)}
 {const _ki=killIn;killIn=function(x,z,r){const q=_ki.apply(this,arguments);try{if(r>=7)impact(x,z,Math.min(r,24),CCOL[(CTX&&CTX.o?CTX.o.cl:cls)||0])}catch(e){}return q}}

 // ---------- мечник, обычный удар: светящийся полумесяц летит вместе с волной ----------
 try{const sp=CLS[1].sp,o0=sp[10];if(typeof o0==='function'){const CRF='varying vec2 u;uniform vec3 c;uniform float o;void main(){float d1=length(u-vec2(0.,-.35)),d2=length(u-vec2(0.,-.62));float a=smoothstep(1.,.93,d1)*smoothstep(.97,1.07,d2)*smoothstep(1.,.5,abs(u.x));if(a<.01)discard;float e=smoothstep(.84,1.,d1);gl_FragColor=vec4(mix(c,vec3(1.),e*.85)*a*o*1.7,1.);}';
   sp[10]=function(){const dem=(CS().demon||0)>0,f=fwd(),p0=CP().position.clone();const r=o0.apply(this,arguments);try{if(!dem&&lv()){
     const mat=new T.ShaderMaterial({transparent:true,depthWrite:false,side:2,blending:AB,uniforms:{c:{value:new T.Color(0x80e0ff)},o:{value:1}},vertexShader:VQ,fragmentShader:CRF}),g=new T.Group(),m=noSh(new T.Mesh(QG,mat));
     m.rotation.x=Math.PI/2;g.add(m);g.rotation.y=Math.atan2(f.x,f.z);g.position.set(p0.x+f.x*2.5,1.8,p0.z+f.z*2.5);S.add(g);let t=0;
     fx.push(dt=>{t+=dt;g.position.x+=f.x*55*dt;g.position.z+=f.z*55*dt;const s=5.5+t*5;g.scale.set(s,s,s);mat.uniforms.o.value=Math.min(1,t/.04)*Math.max(0,1-t/.5);return t<.5},()=>{S.remove(g);mat.dispose()})}}catch(e){console.error('fx3 slash',e)}return r};sp[10]._ufx=o0}}catch(e){console.error('fx3 slash',e)}

 // ---------- каст: руна вспыхивает под героем, вихрь искр, короткий столб силы ----------
 {const _c2=castFX;castFX=function(o,i){const r=_c2.apply(this,arguments);try{if(i>8)return r;const p=o.g.position,c=CCOL[o.cl||0],x=p.x,z=p.z;
   const m=flat(runeT,c,0,1);m.position.set(x,.12,z);S.add(m);let t=0;const rs=rnd()*6;star(x,3.2,z,c,7,.3);
   fx.push(dt=>{t+=dt;const k=t/.75,s=2+7*(1-Math.pow(1-Math.min(k,1),3));m.scale.set(s,s,1);m.rotation.z=rs+t*2.4;m.material.opacity=Math.min(1,t/.08)*(1-k)*.95;
    if(t<.4&&lv())for(let j=0;j<3;j++){const a=t*14+j*2.09,rr=2.6-t*3;emit(x+Math.cos(a)*rr,.3+t*9,z+Math.sin(a)*rr,-Math.sin(a)*6,9,Math.cos(a)*6,.45,j?c:0xffffff,1.5,0)}
    return k<1},()=>{S.remove(m);m.material.dispose()});
   if(!lo())pillar(x,z,c,9,1.5,.5)}catch(e){console.error('fx3 cast',e)}return r}}

 // ---------- руна под каждым героем (цвет класса, медленно вращается) ----------
 const AU=[];
 const aura=q=>{let a=AU.find(o=>o.q===q);if(!a){const m=flat(runeT,0xffffff,.3,3.6),g=flat(glowT,0xffffff,.22,5.2);m.renderOrder=g.renderOrder=-3;S.add(m,g);a={q,m,g};AU.push(a)}return a};

 // ---------- деревья: ярусные ели со стволом вместо простых конусов ----------
 try{const col=(r,g,b)=>new T.Color(r,g,b),P=[[new T.CylinderGeometry(.3,.5,2.6,6),MX(0,1.3,0,0,0,1,1,1),col(1.9,.8,.5)]];
  [[2.7,3.6,3.1,.72],[2.15,3.2,4.9,.9],[1.6,2.9,6.6,1.12],[1.02,2.5,8.2,1.45]].forEach(([r,h,y,l],k)=>P.push([new T.ConeGeometry(r,h,7),MX(0,y,0,(k&1?.05:-.04),(k&1?-.04:.05),1,1,1),col(l*.95,l,l*(1+k*.05))]));
  const G=mergeG(P);G.computeVertexNormals();TM.geometry.dispose();TM.geometry=G;TM.material.vertexColors=true;TM.material.flatShading=true;TM.material.roughness=.85;TM.material.emissive.set(0x04100c);TM.material.needsUpdate=true;
  for(let i=0;i<NT;i++){if(tdead[i])continue;TM.getMatrixAt(i,_m);_m.decompose(_p,_q,_s);D.position.copy(_p);D.rotation.set(0,rnd()*6,0);D.scale.set(_s.x*(.9+rnd()*.25),_s.y*(.9+rnd()*.35),_s.z*(.9+rnd()*.25));D.updateMatrix();TM.setMatrixAt(i,D.matrix);
   TM.setColorAt(i,i%6===0?_c.setHSL(.5,.5,.3):_c.setHSL(.34+rnd()*.09,.5,.2+rnd()*.1))}
  TM.instanceMatrix.needsUpdate=true;TM.instanceColor.needsUpdate=true}catch(e){console.error('fx3 trees',e)}

 // ---------- кристаллы: световые пятна на земле вокруг каждого ----------
 let CG=null;try{const CR=S.children.find(o=>o.isInstancedMesh&&o.geometry&&o.geometry.type==='OctahedronGeometry'&&o.instanceColor);
  if(CR){const n=CR.count;CG=noSh(new T.InstancedMesh(new T.PlaneGeometry(1,1).rotateX(-Math.PI/2),new T.MeshBasicMaterial({map:glowT,transparent:true,opacity:.5,blending:AB,depthWrite:false}),n));
   for(let i=0;i<n;i++){CR.getMatrixAt(i,_m);_m.decompose(_p,_q,_s);CR.getColorAt(i,_c);D.position.set(_p.x,.09,_p.z);D.rotation.set(0,0,0);D.scale.setScalar(5+_s.y*3.2);D.updateMatrix();CG.setMatrixAt(i,D.matrix);CG.setColorAt(i,_c)}
   CG.renderOrder=-3;S.add(CG)}}catch(e){console.error('fx3 crystals',e)}

 // ---------- горы на горизонте (два слоя силуэтов с лунной кромкой) ----------
 let MT=null;try{MT=noSh(new T.Mesh(new T.CylinderGeometry(9,9,7,72,1,true),new T.ShaderMaterial({uniforms:{hz:{value:S.fog.color}},side:T.BackSide,depthWrite:false,fog:false,
  vertexShader:'varying vec3 vD;void main(){vD=position;vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position=p.xyww;}',
  fragmentShader:NZ+`uniform vec3 hz;varying vec3 vD;
float rg(float a,float f,float s){vec2 d=vec2(cos(a),sin(a))*f;return nz(d+s)*.58+nz(d*2.3+s*2.)*.28+nz(d*5.1+s)*.14;}
void main(){float a=atan(vD.z,vD.x),y=vD.y/9.;float h1=.05+.26*pow(rg(a,3.,1.7),1.4),h2=.02+.15*pow(rg(a,5.,9.3),1.3);
 if(y>max(h1,h2))discard;bool nr=y<h2;vec3 c=nr?hz*.40:hz*.66;
 float rim=nr?smoothstep(.012,0.,h2-y):smoothstep(.014,0.,h1-y);c+=vec3(.34,.28,.6)*rim*(nr?.3:.55);
 c=mix(c,hz,smoothstep(.035,-.015,y));gl_FragColor=vec4(c,1.);}`})));MT.renderOrder=-999;S.add(MT)}catch(e){console.error('fx3 mountains',e)}

 // ---------- аниме-линии скорости по краям экрана при больших взрывах (без тряски камеры) ----------
 const SL=document.createElement('div');SL.style.cssText='position:fixed;inset:-20%;pointer-events:none;opacity:0;mix-blend-mode:screen;'+
  'background:repeating-conic-gradient(from 0deg,rgba(255,255,255,0) 0deg 2.1deg,rgba(255,255,255,.75) 2.5deg 2.8deg,rgba(255,255,255,0) 3.2deg 7deg),repeating-conic-gradient(from 1.3deg,rgba(255,255,255,0) 0deg 4.6deg,rgba(255,255,255,.5) 5deg 5.2deg,rgba(255,255,255,0) 5.6deg 11.3deg);'+
  '-webkit-mask-image:radial-gradient(circle,transparent 30%,#000 62%);mask-image:radial-gradient(circle,transparent 30%,#000 62%)';
 try{const W=document.createElement('div');W.style.cssText='position:fixed;inset:0;overflow:hidden;pointer-events:none;contain:strict';W.appendChild(SL);SL.style.position='absolute';R.domElement.insertAdjacentElement('afterend',W)}catch(e){}

 // ---------- циферблат «Цель всей жизни»: римские цифры, деления, двойной обод; большие фигурные стрелки ----------
 dialTex=function(){const N=1024,c=cvs(N),x=c.getContext('2d');x.translate(N/2,N/2);
  x.fillStyle='rgba(4,10,18,.2)';x.beginPath();x.arc(0,0,500,0,PI2);x.fill();x.shadowColor='#7fe9ff';x.shadowBlur=14;x.strokeStyle='#c8f8ff';
  for(const[r,w]of[[498,12],[470,3],[352,4],[338,2],[96,4]]){x.lineWidth=w;x.beginPath();x.arc(0,0,r,0,PI2);x.stroke()}
  for(let k=0;k<60;k++){x.save();x.rotate(k/60*PI2);x.fillStyle='#e8ffff';if(k%5)x.fillRect(-2,-466,4,18);else{x.beginPath();x.moveTo(0,-468);x.lineTo(9,-440);x.lineTo(0,-412);x.lineTo(-9,-440);x.fill()}x.restore()}
  const RN=['XII','I','II','III','IIII','V','VI','VII','VIII','IX','X','XI'];x.textAlign='center';x.textBaseline='middle';x.shadowColor='#ffd070';x.shadowBlur=18;x.fillStyle='#fff0c0';x.font='bold 92px Georgia,serif';
  for(let k=0;k<12;k++){x.save();x.rotate(k/12*PI2);x.fillText(RN[k],0,-294);x.restore()}
  x.shadowColor='#7fe9ff';x.shadowBlur=10;x.strokeStyle='rgba(200,248,255,.55)';x.lineWidth=2;for(let k=0;k<12;k++){x.save();x.rotate(k/12*PI2);x.beginPath();x.moveTo(0,-96);x.lineTo(0,-232);x.stroke();x.restore()}
  return new T.CanvasTexture(c)};
 function hand(len,w,mat,par){const G=new T.Group(),s=new T.Shape(),P=[[0,len],[w*.95,len*.74],[w*.34,len*.69],[w*.5,len*.12],[w*1.5,0],[w*.5,-len*.05],[w*.3,-len*.16],[0,-len*.24]];
  s.moveTo(P[0][0],P[0][1]);for(let i=1;i<P.length;i++)s.lineTo(P[i][0],P[i][1]);for(let i=P.length-2;i>0;i--)s.lineTo(-P[i][0],P[i][1]);s.lineTo(0,len);
  G.add(new T.Mesh(new T.ShapeGeometry(s),mat));const r=new T.Mesh(new T.TorusGeometry(w*1.1,w*.16,6,20),mat);r.position.y=len*.42;G.add(r);const m2=mat.clone();
  G.position.z=1.6;par.add(G);return G}

 // ---------- против фризов: шейдеры эффектов собираются заранее (в меню) и больше никогда не пересобираются ----------
 let pinT=0,warmG=null,warmT=4;
 const pin=()=>{try{const ps=R.info.programs;if(ps)for(const p of ps)if(!p._pin){p._pin=1;p.usedTimes++}}catch(e){}};
 try{warmG=new T.Group();warmG.position.set(0,-300,0);warmG.scale.setScalar(.001);const wm=m=>{const o=noSh(new T.Mesh(QG,m));warmG.add(o)};
  wm(new T.ShaderMaterial({transparent:true,depthWrite:false,blending:AB,uniforms:{c:{value:new T.Color()},o:{value:0},k:{value:0},sd:{value:0}},vertexShader:VQ,fragmentShader:SHF}));
  wm(new T.ShaderMaterial({transparent:true,depthWrite:false,side:2,blending:AB,uniforms:{c:{value:new T.Color()},o:{value:0},t:{value:0},hh:{value:1}},vertexShader:PV,fragmentShader:PF}));
  for(const[a,e]of[[0,1.2],[0,1.3],[1,1.3],[1,1.5],[1,1.6]])wm(FM(0,a,e));wm(am(0,0));
  S.add(warmG);const mg=magic(new T.Vector3(0,-300,0),[{r:.001,c:0,n:6,s:1,dy:0,sty:0}],'g'),ck=UFX.cracks(0,0,.001,0,{y:-300}),sh=UFX.shell(0,-300,0,0);sh.set(.001,0);
  const cu=new T.Mesh(QG,new T.MeshBasicMaterial({map:glowT,transparent:true,blending:AB,depthWrite:false}));warmG.add(cu);
  warmG.userData.end=()=>{try{mg.end();ck.kill();sh.kill()}catch(e){}}}catch(e){console.error('fx3 warm',e)}

 // ---------- покадровое обновление ----------
 function tick(dt){tt+=dt;hitN=0;if((pinT-=.016)<=0){pinT=1;pin()}if(warmG&&(warmT-=.016)<=0){pin();try{warmG.userData.end();S.remove(warmG);warmG.children.forEach(o=>o.material.dispose())}catch(e){}warmG=null}spdCool=Math.max(0,spdCool-dt);
  if(spd>0){spd=Math.max(0,spd-dt*3.2);SL.style.opacity=(spd*spd*.42).toFixed(3)}else if(SL.style.opacity!=='0')SL.style.opacity='0';
  if(MT)MT.position.copy(C.position);
  if(CG)CG.material.opacity=.42+.12*Math.sin(tt*1.7);
  let any=false;for(let i=0;i<NH;i++){const h=HL[i];if(h.t<=0)continue;any=true;h.t-=dt;if(h.t<=0){_m.makeScale(0,0,0);HM.setMatrixAt(i,_m);continue}
   const k=1-h.t/h.T,s=h.s*(.35+.65*Math.sin(Math.min(1,k*1.6)*Math.PI*.5))*(1-k*.3);_q.setFromAxisAngle(_z,h.r+k*.8).premultiply(C.quaternion);_p.set(h.x,h.y,h.z);_s.set(s,s,s);_m.compose(_p,_q,_s);HM.setMatrixAt(i,_m);HM.setColorAt(i,_c.set(h.c).multiplyScalar((1-k)*(1-k)*1.6))}
  if(any){HM.instanceMatrix.needsUpdate=true;HM.instanceColor.needsUpdate=true}
  for(const a of AU)a.m.visible=a.g.visible=false;
  for(const q of players){if(!q||!q.g||!q.g.visible||q.dead>0||!q.g.parent)continue;const a=aura(q),c=CCOL[(q===ME?cls:q.cl)||0],p=q.g.position;a.m.visible=a.g.visible=true;
   a.m.position.set(p.x,.07,p.z);a.g.position.set(p.x,.06,p.z);a.m.rotation.z=tt*.5;a.m.material.color.setHex(c);a.g.material.color.setHex(c);a.m.material.opacity=.26+.08*Math.sin(tt*2.3)}}
 {const _t=UFX.tick;UFX.tick=dt=>{_t(dt);try{tick(dt)}catch(e){console.error('fx3 tick',e)}}}
 return{star,tick,hand}})();
// ===== FX3-END =====
