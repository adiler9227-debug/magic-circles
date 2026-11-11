// ---------- Архимаг звёздной бездны (оригинальный дизайн: длинные белые волосы, чёрно-фиолетовая мантия с золотом и цепями, посох с терновым кольцом и сферой) ----------
function makeArchmage(){const T=THREE,{std,glow,clothTex,cloth,flame,ringTex,ad,Me}=HZ,g=new T.Group(),B=new T.Group();g.add(B);
 const GOLD=std(0xd9b25a,{metalness:.9,roughness:.25,emissive:0x2e2008}),GEM=c=>new T.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:1.1,metalness:.2,roughness:.12});
 const robe=std(0x1b1134,{emissive:0x06030e,map:clothTex('#1b1134','#c9a24a','rune',3)}),robe2=std(0x1b1134,{emissive:0x06030e,map:clothTex('#1b1134','#c9a24a','rune',3),side:2}),
  vio=std(0x4f22a0,{emissive:0x15062f,map:clothTex('#3f1888','#e2c070','star',11),side:2}),skin=std(0xeadbd6,{roughness:.7}),
  hairT=(()=>{const c=document.createElement('canvas');c.width=64;c.height=256;const x=c.getContext('2d'),gr=x.createLinearGradient(0,0,0,256);gr.addColorStop(0,'#ffffff');gr.addColorStop(1,'#cdbff0');x.fillStyle=gr;x.fillRect(0,0,64,256);for(let i=0;i<22;i++){x.strokeStyle=i%3?'rgba(150,130,200,.35)':'rgba(255,255,255,.7)';x.lineWidth=1+i%2;x.beginPath();const px=3+i*2.8;x.moveTo(px,0);x.bezierCurveTo(px+4,80,px-4,170,px+2,256);x.stroke()}return new T.CanvasTexture(c)})(),hair=std(0xffffff,{map:hairT,roughness:.5,emissive:0x3a3555,side:2}),capeO=std(0x2c1b58,{emissive:0x0d0624,map:clothTex('#2c1b58','#e0bc66','star',21),side:2}),V2=(a,b)=>new T.Vector2(a,b),PI=Math.PI;
 // длинная узкая мантия с золотой каймой
 ad(B,Me(new T.LatheGeometry([[1.15,0],[1.08,.5],[.86,1.4],[.66,2.2],[.56,2.75]].map(p=>V2(p[0],p[1])),28),robe));
 ad(B,Me(new T.LatheGeometry([[1.17,.02],[1.165,.14]].map(p=>V2(p[0],p[1])),28),GOLD));
 // полотнища спереди: фиолетовое со звёздами в центре, чёрные с рунами по бокам
 const pC=ad(B,cloth(.5,2.45,3,8,vio,1.4),0,2.62,.64);pC.rotation.x=-.3;
 const pL=ad(B,cloth(.5,2.5,3,8,robe2,1.4),-.44,2.62,.52);pL.rotation.set(-.3,-.25,.05);const pR=ad(B,cloth(.5,2.5,3,8,robe2,1.4),.44,2.62,.52);pR.rotation.set(-.3,.25,-.05);
 // торс, золотая отделка, пояс с камнем, цепи с подвесками
 ad(B,Me(new T.CylinderGeometry(.5,.62,1.45,16),robe),0,3.35,0);
 for(const q of[-1,1])ad(B,Me(new T.BoxGeometry(.07,1.3,.05),GOLD),q*.17,3.4,.55).rotation.x=-.1;
 ad(B,Me(new T.TorusGeometry(.63,.07,8,28),GOLD),0,2.68,0).rotation.x=PI/2;{const d=ad(B,Me(new T.OctahedronGeometry(.16,0),GEM(0x9a4cff)),0,2.66,.68);d.scale.set(.8,1.3,.6)}
 const chain=(r,y,z,gem)=>{const c=ad(B,Me(new T.TorusGeometry(r,.018,5,20,PI),GOLD),0,y,z);c.rotation.z=PI;if(gem){const d=ad(B,Me(new T.OctahedronGeometry(.055,0),GEM(0xb070ff)),0,y-r-.06,z+.01);d.scale.y=1.6}};
 chain(.3,3.86,.56,1);chain(.42,3.7,.6,0);chain(.36,2.6,.66,1);chain(.52,2.58,.6,0);
 // высокий воротник
 ad(B,Me(new T.CylinderGeometry(.8,.46,1.0,18,1,true,PI*.5,PI),robe2),0,4.55,-.1);ad(B,Me(new T.CylinderGeometry(.76,.44,.96,18,1,true,PI*.5,PI),vio),0,4.56,-.08);
 ad(B,Me(new T.TorusGeometry(.8,.03,5,20,PI),GOLD),0,5.05,-.1).rotation.set(PI/2,0,PI);
 // наплечники: тёмные с золотым кантом, шипом и камнем
 for(const q of[-1,1]){const G=new T.Group();G.position.set(q*.84,4.0,0);B.add(G);ad(G,Me(new T.SphereGeometry(.44,16,10,0,PI2,0,PI/2),robe)).scale.set(1.2,.72,1.1);ad(G,Me(new T.TorusGeometry(.5,.035,5,22),GOLD),0,.01,0).rotation.x=PI/2;
  ad(G,Me(new T.ConeGeometry(.09,.55,5),GOLD),q*.36,.3,0).rotation.z=-q*1.0;ad(G,Me(new T.OctahedronGeometry(.09,0),GEM(0x9a4cff)),0,.34,.14)}
 // плащ: снаружи чёрный с золотыми рунами, внутри фиолетовый со звёздами
 const cape=ad(B,cloth(2.2,4.3,5,12,vio,1.3),0,4.2,-.6);cape.rotation.x=.1;const cape2=ad(B,cloth(1.7,4.2,4,12,capeO,1.3),0,4.22,-.7);cape2.rotation.x=.11;const capeS=[-1,1].map(q=>{const a=ad(B,cloth(1.35,3.9,3,12,capeO,1.25),q*.75,4.2,-.62);a.rotation.set(.1,q*.5,q*.2);const b=ad(B,cloth(1.0,3.3,3,10,robe2,1.2),q*1.25,4.1,-.38);b.rotation.set(.08,q*.95,q*.32);return[a,b]}).flat();
 // рукава-колокола
 const arm=q=>{const G=new T.Group();G.position.set(q*.9,3.95,0);B.add(G);ad(G,Me(new T.CylinderGeometry(.19,.46,1.55,14,1,true),robe2),0,-.74,0);ad(G,Me(new T.CylinderGeometry(.17,.42,1.5,14,1,true),vio),0,-.74,0);
  ad(G,Me(new T.CylinderGeometry(.45,.47,.1,14,1,true),GOLD),0,-1.5,0);ad(G,Me(new T.SphereGeometry(.14,10,8),skin),0,-1.56,0);G.rotation.z=q*.18;return G};
 const aL=arm(-1),aR=arm(1);
 // голова: бледное лицо, фиолетовые глаза, длинные белые волосы
 const H=new T.Group();H.position.set(0,4.85,.04);B.add(H);ad(H,Me(new T.SphereGeometry(.34,16,12),skin)).scale.set(.9,1.12,.95);
 const eyes=[-1,1].map(q=>{ad(H,Me(new T.BoxGeometry(.12,.025,.02),std(0x2a2038)),q*.12,.1,.3);const e=ad(H,Me(new T.SphereGeometry(.05,8,6),glow(0xb070ff)),q*.12,.03,.3);e.scale.set(1.3,.7,.6);return e});
 {const hc=ad(H,Me(new T.SphereGeometry(.38,16,12,0,PI2,0,PI*.55),hair),0,.05,-.04);hc.rotation.x=-.38;ad(H,Me(new T.SphereGeometry(.36,14,10),hair),0,-.02,-.13).scale.set(1,1.05,.9)}
 for(let i=0;i<7;i++){const a=(i-3)*.25,c=ad(H,Me(new T.ConeGeometry(.06,.32,5),hair),Math.sin(a)*.3,.26,Math.cos(a)*.28);c.rotation.set(2.25,0,-a*.9)}
 for(const q of[-1,1]){const c=ad(H,Me(new T.ConeGeometry(.085,1.7,6),hair),q*.33,-.78,.12);c.rotation.set(PI,0,-q*.06)}
 const hairC=ad(B,cloth(.5,3.7,2,10,hair,1.25),0,5.1,-.84);hairC.rotation.x=.09;const hairB=[[-.36,3.4,-.1],[.36,3.5,.1],[-.66,3.0,-.2],[.66,3.1,.2]].map(([x,L,rz],i)=>{const c=ad(B,cloth(.42,L,2,9,hair,1.2),x,5.05-Math.abs(x)*.15,-.8+Math.abs(x)*.12);c.rotation.set(.09,x*.5,rz);return c});
 const hairS=[-1,1].map(q=>{const c=ad(B,cloth(.55,3.1,2,8,hair,1.2),q*.62,4.95,-.5);c.rotation.set(.06,q*.7,0);return c});
 // посох: чёрное древко, терновое золотое кольцо с шипами, звёздная сфера, цепи с камнями
 const st=new T.Group();st.position.set(1.28,2.35,.42);B.add(st);
 ad(st,Me(new T.CylinderGeometry(.06,.08,5.8,8),std(0x120c18,{roughness:.6,metalness:.4})),0,1.1,0);for(let i=0;i<5;i++)ad(st,Me(new T.TorusGeometry(.09,.022,6,14),GOLD),0,-.9+i*.9,0).rotation.x=PI/2;
 ad(st,Me(new T.ConeGeometry(.08,.4,6),GOLD),0,-1.95,0).rotation.x=PI;
 const head=new T.Group();head.position.y=4.1;st.add(head);
 ad(head,Me(new T.TorusGeometry(.56,.04,6,30),GOLD),0,.6,0);ad(head,Me(new T.TorusGeometry(.47,.02,5,26),GOLD),0,.6,0);
 [.8,.3,.5,.3,.42,.3,.5,.3].forEach((L,i)=>{const a=PI/2+i*PI/4,c=ad(head,Me(new T.ConeGeometry(i%2?.05:.07,L,5),GOLD),Math.cos(a)*(.56+L/2),.6+Math.sin(a)*(.56+L/2),0);c.rotation.z=a-PI/2});
 for(let i=0;i<8;i++){const a=i*PI/4+PI/8,c=ad(head,Me(new T.ConeGeometry(.03,.16,4),GOLD),Math.cos(a)*.4,.6+Math.sin(a)*.4,0);c.rotation.z=a+PI/2}
 const cry=ad(head,Me(new T.SphereGeometry(.34,20,14),new T.MeshStandardMaterial({color:0x2a0a50,emissive:0x8a40ff,emissiveIntensity:1.3,metalness:.1,roughness:.08})),0,.6,0);
 const cg=ad(head,Me(new T.SphereGeometry(.62,14,10),glow(0xa060ff,.35)),0,.6,0),cg2=ad(head,Me(new T.SphereGeometry(1.2,14,10),glow(0x6030ff,.12)),0,.6,0);
 const sats=[0,1,2].map(i=>ad(head,Me(new T.OctahedronGeometry(.05,0),glow([0xffffff,0xd0a0ff,0xffffff][i])),0,.6,0));
 const chs=[-1,1].map(q=>{const G=new T.Group();G.position.set(q*.56,.6,0);head.add(G);ad(G,Me(new T.CylinderGeometry(.012,.012,.9,4),GOLD),0,-.45,0);ad(G,Me(new T.OctahedronGeometry(.07,0),GEM(0xb070ff)),0,-.98,0).scale.y=1.5;return G});
 let lt=0,ct=0;
 return{g,cast(){ct=.9},u(t,mv){const dt=Math.min(.1,Math.max(0,t-lt));lt=t;HZ.T.value=t;ct=Math.max(0,ct-dt);const ca=Math.min(1,ct*4),w=mv?1:0;
  B.position.y=.3+Math.sin(t*1.8)*.14;B.rotation.x=w*.12;
  aR.rotation.x=-.35-ca*.75-w*.2+Math.sin(t*1.2)*.04;aR.rotation.z=.12;st.position.y=2.35+ca*.9;st.position.z=.42+ca*.35;st.rotation.x=-.06-ca*.3;st.rotation.z=-.05;aL.rotation.x=-.3-Math.sin(t*1.5)*.06-ca*.9;aL.rotation.z=-.25;
  H.rotation.y=Math.sin(t*.7)*.12;H.rotation.x=-ca*.15;
  pC.userData.wv(t+.6,1,w*.6);pL.userData.wv(t,1,w*.6);pR.userData.wv(t+1.3,1,w*.6);cape.userData.wv(t,1.3,w);cape2.userData.wv(t,1.3,w);hairC.userData.wv(t+.4,1.1,w*.9);hairS.forEach((c,i)=>c.userData.wv(t+i,1,w*.8));hairB.forEach((c,i)=>c.userData.wv(t+i*.7,1.2,w*.9));capeS.forEach((c,i)=>c.userData.wv(t+i*.5,1.3,w));
  cry.material.emissiveIntensity=1.2+.35*Math.sin(t*3)+ca*1.5;cry.rotation.y=t*.6;const sc=1+Math.sin(t*4)*.08+ca*.6;cg.scale.setScalar(sc);cg2.scale.setScalar(sc*(1+ca));cg2.material.opacity=.12+ca*.25;
  sats.forEach((s,i)=>{const a=t*2.4+i*2.09;s.position.set(Math.cos(a)*.44,.6+Math.sin(a*1.3)*.25,Math.sin(a)*.44)});
  chs.forEach((c,i)=>{c.rotation.z=Math.sin(t*2.1+i*2)*.14+w*.2;c.rotation.x=Math.sin(t*1.7+i)*.1});
  eyes.forEach(e=>e.scale.set(1.3*(1+ca*.5),.7*(1+ca*.5),.6))}}}

// ---------- Повелитель пламени с тяжёлым мечом (оригинальный дизайн: чёрные одежды, длинные чёрные волосы, диск-лотос за спиной, широкий чёрный меч, огненный лотос в руке) ----------
function makeSaint(){const T=THREE,{std,glow,clothTex,cloth,flame,ringTex,ad,Me}=HZ,g=new T.Group(),B=new T.Group();g.add(B);const PI=Math.PI;
 const GOLD=std(0xcfa544,{metalness:.9,roughness:.3,emissive:0x2a1800}),blk=std(0x15111a,{map:clothTex('#15111a','#b08a3a','flame',13),emissive:0x040205}),
  blkS=std(0x15111a,{side:2,map:clothTex('#15111a','#b08a3a','flame',17)}),red=std(0xa31a22,{emissive:0x2a0407,side:2}),skin=std(0xe8cdb6),hairM=std(0x09080d,{roughness:.4,metalness:.25,side:2}),
  iron=std(0x17151c,{metalness:.85,roughness:.32,emissive:0x050408});
 // длинное чёрное одеяние с золотой каймой
 ad(B,Me(new T.LatheGeometry([[1.05,0],[1.0,.5],[.82,1.3],[.6,1.95]].map(p=>new T.Vector2(p[0],p[1])),24),blk));
 ad(B,Me(new T.LatheGeometry([[1.07,.01],[1.06,.13]].map(p=>new T.Vector2(p[0],p[1])),24),GOLD));
 const fp=ad(B,cloth(.6,1.9,3,8,blkS,1.3),0,1.95,.62);fp.rotation.x=-.3;
 // торс, перекрёстный ворот, красный кушак с пряжкой и длинными лентами
 ad(B,Me(new T.CylinderGeometry(.5,.62,1.35,14),blk),0,2.6,0);
 for(const q of[-1,1]){const v=ad(B,Me(new T.BoxGeometry(.13,1.1,.06),GOLD),q*.16,2.75,.52);v.rotation.set(-.12,0,q*.45)}
 ad(B,Me(new T.CylinderGeometry(.64,.64,.3,16),red),0,2.0,0);ad(B,Me(new T.BoxGeometry(.3,.26,.08),GOLD),0,2.0,.64);for(const q of[-1,1])ad(B,Me(new T.TorusGeometry(.645,.022,5,24),GOLD),0,2.0+q*.15,0).rotation.x=PI/2;
 const rib=[-1,1].map(q=>{const c=ad(B,cloth(.24,2.7,2,10,red,1.1),q*.5,2.05,-.45);c.rotation.set(.25,q*.5,q*.12);return c});
 // наплечники
 for(const q of[-1,1]){const p=ad(B,Me(new T.SphereGeometry(.34,12,8,0,PI2,0,PI/2),iron),q*.66,3.22,0);p.scale.set(1.2,.7,1.1);ad(B,Me(new T.TorusGeometry(.36,.03,5,18),GOLD),q*.66,3.22,0).rotation.x=PI/2}
 // руки и широкие рукава
 const arm=q=>{const G=new T.Group();G.position.set(q*.7,3.2,0);B.add(G);ad(G,Me(new T.CylinderGeometry(.16,.42,1.25,12,1,true),blkS),0,-.6,0);ad(G,Me(new T.CylinderGeometry(.4,.42,.09,12,1,true),GOLD),0,-1.2,0);ad(G,Me(new T.SphereGeometry(.12,8,6),skin),0,-1.32,0);return G};
 const aL=arm(-1),aR=arm(1);aL.rotation.z=-.2;
 // голова: лицо, длинные распущенные чёрные волосы, небольшая заколка
 const H=new T.Group();H.position.set(0,3.62,0);B.add(H);ad(H,Me(new T.SphereGeometry(.36,16,12),skin)).scale.set(.92,1.08,.95);
 for(const q of[-1,1]){ad(H,Me(new T.BoxGeometry(.1,.035,.02),std(0x111018)),q*.13,.05,.33);ad(H,Me(new T.SphereGeometry(.028,6,5),glow(0xffa040)),q*.13,.04,.345)}
 {const hc=ad(H,Me(new T.SphereGeometry(.4,16,12,0,PI2,0,PI*.5),hairM),0,.06,-.05);hc.scale.set(1,1.05,1.08);hc.rotation.x=-.5;ad(H,Me(new T.SphereGeometry(.4,14,10),hairM),0,-.02,-.12).scale.set(.98,1,.9)}
 for(let i=0;i<7;i++){const a=(i-3)*.24,c=ad(H,Me(new T.ConeGeometry(.06,.3,5),hairM),Math.sin(a)*.31,.27,Math.cos(a)*.29);c.rotation.set(2.25,0,-a*.9)}
 for(const q of[-1,1]){const c=ad(H,Me(new T.ConeGeometry(.075,1.25,5),hairM),q*.32,-.5,.12);c.rotation.set(PI,0,-q*.08)}
 ad(H,Me(new T.CylinderGeometry(.08,.1,.14,8),GOLD),0,.42,-.1);
 const hairC=ad(B,cloth(1.0,2.5,4,9,hairM,1.2),0,3.86,-.66);hairC.rotation.x=.1;
 const tail=[];{let par=H;for(let i=0;i<7;i++){const G=new T.Group();G.position.set(0,i?-.32:.3,i?0:-.32);par.add(G);const m=ad(G,Me(new T.ConeGeometry(.13-i*.012,.4,6),hairM),0,-.18,0);m.rotation.x=PI;tail.push(G);par=G}}
 // плащ: чёрный снаружи, красный внутри
 const cape=ad(B,cloth(1.8,2.9,5,10,red,1.3),0,3.28,-.5);cape.rotation.x=.08;const cape2=ad(B,cloth(1.95,2.8,5,10,blkS,1.3),0,3.3,-.57);cape2.rotation.x=.09;
 // большой диск-лотос за спиной: кремовый с золотыми лепестками, золотой обод и языки пламени по кругу
 const manT=(()=>{const N=512,c=document.createElement('canvas');c.width=c.height=N;const x=c.getContext('2d'),C0=N/2;x.translate(C0,C0);
  let gr=x.createRadialGradient(0,0,10,0,0,C0);gr.addColorStop(0,'#fff6dc');gr.addColorStop(.55,'#f1d9b0');gr.addColorStop(.8,'#c8523c');gr.addColorStop(1,'#7a1418');x.fillStyle=gr;x.beginPath();x.arc(0,0,C0-4,0,PI2);x.fill();
  const petal=(n,r0,r1,w,fill,stroke)=>{for(let i=0;i<n;i++){x.save();x.rotate(i/n*PI2);x.beginPath();x.moveTo(0,-r0);x.quadraticCurveTo(w,-(r0+r1)/2,0,-r1);x.quadraticCurveTo(-w,-(r0+r1)/2,0,-r0);x.fillStyle=fill;x.fill();x.strokeStyle=stroke;x.lineWidth=3;x.stroke();x.restore()}};
  petal(24,150,246,34,'rgba(205,165,70,.55)','#8a6a20');petal(16,84,176,36,'rgba(232,200,110,.8)','#8a6a20');petal(8,24,104,40,'#e9c668','#7a5a18');
  x.strokeStyle='#b08a3a';for(const[r,w]of[[250,8],[180,3],[106,4]]){x.lineWidth=w;x.beginPath();x.arc(0,0,r,0,PI2);x.stroke()}
  x.fillStyle='#c9a24a';x.beginPath();x.arc(0,0,26,0,PI2);x.fill();x.strokeStyle='#7a5a18';x.lineWidth=3;x.stroke();const t=new T.CanvasTexture(c);t.anisotropy=4;return t})();
 const halo=new T.Group();halo.position.set(0,4.2,-1.1);halo.scale.setScalar(.72);B.add(halo);
 const disc=ad(halo,Me(new T.CircleGeometry(1.55,48),new T.MeshBasicMaterial({map:manT,side:2,transparent:true,opacity:.97})));ad(halo,Me(new T.TorusGeometry(1.56,.06,6,48),GOLD));
 const fl=[];for(let i=0;i<14;i++){const a=i/14*PI2,L=i%2?.5:.8,c=ad(halo,Me(new T.ConeGeometry(.17,L,4),GOLD),Math.cos(a)*(1.6+L/2),Math.sin(a)*(1.6+L/2),0);c.rotation.z=a-PI/2;c.scale.z=.35;
  if(!(i%2)){const m=ad(halo,Me(new T.PlaneGeometry(.55,1.2),flame(0xffe0a0,0xff3010,.4,1.2)),Math.cos(a)*1.7,Math.sin(a)*1.7,-.03);m.rotation.z=a-PI/2;m.geometry.translate(0,.5,0);fl.push(m)}}
 const hg=ad(halo,Me(new T.CircleGeometry(2.5,32),glow(0xff5a20,.1)),0,0,-.06);
 // огненный лотос над левой ладонью: лепестки разного пламени
 const lot=new T.Group();B.add(lot);const LC=[0x40e0ff,0x60ff90,0xb070ff,0xffd040,0xffffff,0xff5a30],pet=[];
 for(let r=0;r<2;r++)for(let i=0;i<6;i++){const a=i/6*PI2+r*.52,G=new T.Group();G.rotation.y=a;lot.add(G);const m=ad(G,Me(new T.ConeGeometry(.1,.36-r*.08,4),glow(LC[(i+r*3)%6],.9)),0,.1+r*.06,.17-r*.06);m.scale.z=.4;m.rotation.x=.75-r*.4;pet.push(m)}
 ad(lot,Me(new T.SphereGeometry(.1,10,8),glow(0xffffff,1)),0,.12,0);const lg=ad(lot,Me(new T.SphereGeometry(.42,12,8),glow(0x80c0ff,.22)),0,.14,0);
 const lf=ad(lot,Me(new T.PlaneGeometry(.5,.9),flame(0xffffff,0x60a0ff,.45,1.6)),0,.15,0);lf.geometry.translate(0,.4,0);
 // главный меч: тяжёлый широкий чёрный клинок с золотой насечкой и красными знаками
 const swg=new T.Group();swg.position.set(.9,2.1,.6);
 ad(swg,Me(new T.BoxGeometry(.5,.09,3.5),iron),0,0,2.25);ad(swg,Me(new T.BoxGeometry(.4,.1,.22),iron),0,0,4.1);
 for(const q of[-1,1])ad(swg,Me(new T.BoxGeometry(.03,.1,3.5),GOLD),q*.2,0,2.25);
 const bl=ad(swg,Me(new T.BoxGeometry(.1,.1,2.9),glow(0xff4a20,.7)),0,0,2.3);for(let i=0;i<5;i++)ad(swg,Me(new T.BoxGeometry(.3,.1,.05),glow(0xff7030,.6)),0,0,1.1+i*.6);
 const sh1=ad(swg,Me(new T.PlaneGeometry(.9,3.8),flame(0xfff2b0,0xff3a10,.3,2)),0,0,2.3);sh1.rotation.x=-PI/2;const sh2=ad(swg,Me(new T.PlaneGeometry(.55,3.8),flame(0xfff2b0,0xff3a10,.3,2)),0,0,2.3);sh2.rotation.set(-PI/2,PI/2,0);
 ad(swg,Me(new T.BoxGeometry(.8,.16,.2),GOLD),0,0,.42);ad(swg,Me(new T.CylinderGeometry(.065,.065,.85,8),red),0,0,-.05).rotation.x=PI/2;ad(swg,Me(new T.TorusGeometry(.11,.035,6,14),GOLD),0,0,-.58);
 const tas=ad(swg,Me(new T.ConeGeometry(.06,.5,6),red),0,-.25,-.6);
 B.add(swg);let swing=0,lt=0,ph=0,em=0;
 return{g,swg,hit(){swing=1},cast(){swing=1},u(t,mv){const dt=Math.min(.1,Math.max(0,t-lt));lt=t;HZ.T.value=t;swing=Math.max(0,swing-dt*3.2);ph+=dt*(mv?11:0);const w=mv?1:0;
  swg.rotation.set(swing>0?-1.6+(1-swing)*2.9:.25,swing>0?(swing-.5)*.8:0,0);aR.rotation.x=swing>0?-1.6+(1-swing)*1.8:-.5;aR.rotation.z=.15;aL.rotation.x=-.95+Math.sin(t*1.3)*.05;aL.rotation.z=-.25;
  B.position.y=mv?Math.abs(Math.sin(t*11))*.2:Math.sin(t*1.6)*.05;B.rotation.x=w*.14;H.rotation.y=Math.sin(t*.6)*.1;
  tail.forEach((G,i)=>{G.rotation.x=(i?.12:.5)+w*.35+Math.sin(t*3-i*.7)*(.06+i*.02);G.rotation.z=Math.sin(t*2.2-i*.6)*.05*i});tas.rotation.x=Math.sin(t*5)*.3;
  fp.userData.wv(t,1,w*.5);cape.userData.wv(t+.7,1.2,w);cape2.userData.wv(t+.7,1.2,w);hairC.userData.wv(t+.3,1.1,w*.9);rib.forEach((c,i)=>c.userData.wv(t*1.4+i*2,1.8,w*1.2));
  halo.rotation.z=t*.12;fl.forEach((m,i)=>{const s=.8+.35*Math.sin(t*5+i*1.7);m.scale.set(s,s,1)});hg.material.opacity=.08+.05*Math.sin(t*2.5);
  lot.position.set(-.98,2.42+Math.sin(t*2.2)*.06,1.05);lot.rotation.y=t*1.6;lg.scale.setScalar(1+.15*Math.sin(t*6));bl.material.opacity=.55+.25*Math.sin(t*4);
  em+=dt*(mv?14:5);while(em>1){em--;const p=g.getWorldPosition(_hzv);emit(p.x+(rnd()-.5)*2,p.y+rnd()*3.5,p.z+(rnd()-.5)*2,(rnd()-.5)*1.5,2+rnd()*3,(rnd()-.5)*1.5,.9,rnd()<.5?0xff7030:0xffc060,.9,1)}}}}
