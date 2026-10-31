// Сервер игры: раздаёт index.html, ведёт список «кто онлайн» и комнаты (до 4 игроков), пересылает сообщения в бою.
const http=require('http'),fs=require('fs'),path=require('path'),{WebSocketServer}=require('ws');
const PORT=process.env.PORT||3000,MAX=4,rooms=new Map(),all=new Set();let uid=0,pn=0;
const FILES={'/':['index.html','text/html; charset=utf-8'],'/index.html':['index.html','text/html; charset=utf-8'],'/manifest.json':['manifest.json','application/manifest+json'],'/sw.js':['sw.js','text/javascript'],'/icon-192.png':['icon-192.png','image/png'],'/icon-512.png':['icon-512.png','image/png']};
// файлы отдаются сжатыми (gzip) и с ETag: повторный заход — почти мгновенно (ответ 304)
const zlib=require('zlib'),CACHE={};
function getFile(name,cb){const fp=path.join(__dirname,name);fs.stat(fp,(e,st)=>{if(e)return cb(e);const c=CACHE[name];if(c&&c.m===st.mtimeMs&&c.s===st.size)return cb(null,c);
 fs.readFile(fp,(e2,d)=>{if(e2)return cb(e2);zlib.gzip(d,{level:9},(e3,gz)=>{CACHE[name]={m:st.mtimeMs,s:st.size,d,gz:e3?null:gz,etag:'"'+st.size.toString(36)+'-'+Math.floor(st.mtimeMs).toString(36)+'"'};cb(null,CACHE[name])})})})}
const server=http.createServer((q,r)=>{const f=FILES[(q.url||'/').split('?')[0]];if(!f){r.writeHead(404);return r.end('not found')}
 getFile(f[0],(e,c)=>{if(e){r.writeHead(500);return r.end(f[0]+' not found')}
  if(q.headers['if-none-match']===c.etag){r.writeHead(304,{ETag:c.etag,'Cache-Control':'no-cache'});return r.end()}
  const gz=c.gz&&/\bgzip\b/.test(q.headers['accept-encoding']||''),body=gz?c.gz:c.d,h={'Content-Type':f[1],'Cache-Control':'no-cache',ETag:c.etag,'Content-Length':body.length,Vary:'Accept-Encoding'};if(gz)h['Content-Encoding']='gzip';
  r.writeHead(200,h);r.end(body)})});
['index.html','sw.js','manifest.json'].forEach(n=>getFile(n,()=>{}));
const wss=new WebSocketServer({server,maxPayload:65536});
const send=(ws,o)=>{if(ws.readyState===1)ws.send(JSON.stringify(o))},mem=R=>R.p.filter(Boolean);
const freeC=(R,c,ws)=>{c=(c|0);if(c<0||c>4)c=0;const used=new Set(mem(R).filter(w=>w!==ws).map(w=>w.cls));if(!used.has(c))return c;for(let k=0;k<5;k++)if(!used.has(k))return k;return c};
const st=w=>!w.R?'lobby':w.R.started?'battle':'room';
// список онлайн + открытые комнаты — всем в лобби
function bcast(){
 const players=[...all].map(w=>({id:w.id,name:w.name,st:st(w)}));
 const list=[...rooms.values()].map(R=>({code:R.code,host:R.p[0]?R.p[0].name:'?',n:mem(R).length,started:R.started,pvp:R.pvp}));
 all.forEach(w=>send(w,{t:'list',me:w.id,players,rooms:list}))}
function roomInfo(R){const names=R.p.map(w=>w?w.name:null);mem(R).forEach(w=>send(w,{t:'lobby',n:mem(R).length,names,pvp:R.pvp,cls:R.p.map(x=>x?x.cls:null)}))}
function leave(ws){const R=ws.R;if(!R)return;ws.R=null;R.p[ws.slot]=null;const rest=mem(R);
 if(!rest.length){rooms.delete(R.code);return}
 if(R.started)rest.forEach(w=>send(w,{t:'left',f:ws.slot}));
 else if(ws.slot===0){rest.forEach(w=>{send(w,{t:'closed',msg:'Хост закрыл комнату'});w.R=null});rooms.delete(R.code)}
 else roomInfo(R)}
wss.on('connection',ws=>{ws.alive=true;ws.id=++uid;ws.name='Игрок '+(++pn);all.add(ws);
 ws.on('pong',()=>ws.alive=true);
 send(ws,{t:'hello',id:ws.id,name:ws.name});bcast();
 ws.on('message',raw=>{let m;try{m=JSON.parse(raw)}catch(e){return}
  if(m.t==='name'){ws.name=String(m.name||'').trim().slice(0,14)||ws.name;if(ws.R)roomInfo(ws.R);bcast();return}
  if(!ws.R||m.t==='host'||m.t==='join'){
   if(m.t==='host'&&!ws.R){let c;do{c=String(1000+Math.floor(Math.random()*9000))}while(rooms.has(c));const R={code:c,p:[ws],started:false,pvp:0};rooms.set(c,R);ws.R=R;ws.slot=0;ws.cls=freeC(R,m.c,ws);send(ws,{t:'room',code:c,slot:0,n:1});roomInfo(R);bcast()}
   else if(m.t==='join'&&!ws.R){const R=rooms.get(String(m.code));if(!R){send(ws,{t:'err',msg:'Комната уже закрыта'});return bcast()}if(R.started)return send(ws,{t:'err',msg:'Бой уже идёт'});let s=R.p.findIndex(x=>!x);if(s<0)s=R.p.length;if(s>=MAX)return send(ws,{t:'err',msg:'Комната заполнена (4/4)'});R.p[s]=ws;ws.R=R;ws.slot=s;ws.cls=freeC(R,m.c,ws);send(ws,{t:'joined',slot:s,n:mem(R).length});roomInfo(R);bcast()}
   return}
  const R=ws.R;
  if(m.t==='leave'){leave(ws);send(ws,{t:'closed',msg:''});bcast();return}
  if(m.t==='mode'){if(ws.slot===0&&!R.started){R.pvp=m.pvp?1:0;roomInfo(R);bcast()}return}
  if(m.t==='cls'){if(!R.started){ws.cls=freeC(R,m.c,ws);roomInfo(R)}return}
  if(m.t==='start'){if(ws.slot===0&&!R.started&&mem(R).length>1){R.started=true;const ids=R.p.map((w,i)=>w?i:-1).filter(i=>i>=0);R.p.forEach((w,i)=>w&&send(w,{t:'ready',n:ids.length,slot:i,ids,pvp:R.pvp,names:R.p.map(x=>x?x.name:null)}));bcast()}return}
  if(!R.started)return;m.f=ws.slot;const s=JSON.stringify(m);R.p.forEach(w=>{if(w&&w!==ws&&w.readyState===1)w.send(s)})});
 ws.on('close',()=>{all.delete(ws);leave(ws);bcast()})});
setInterval(()=>wss.clients.forEach(w=>{if(!w.alive)return w.terminate();w.alive=false;w.ping()}),25000);
server.listen(PORT,'0.0.0.0',()=>console.log('listening',PORT));
