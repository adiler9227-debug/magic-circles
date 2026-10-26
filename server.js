// Сервер игры: раздаёт index.html и пересылает сообщения между игроками в комнате (до 4 человек).
const http=require('http'),fs=require('fs'),path=require('path'),{WebSocketServer}=require('ws');
const PORT=process.env.PORT||3000,MAX=4,rooms=new Map();
const server=http.createServer((q,r)=>{fs.readFile(path.join(__dirname,'index.html'),(e,d)=>{if(e){r.writeHead(500);return r.end('index.html not found')}r.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'});r.end(d)})});
const wss=new WebSocketServer({server,maxPayload:65536});
const send=(ws,o)=>{if(ws.readyState===1)ws.send(JSON.stringify(o))},mem=R=>R.p.filter(Boolean);
const lobby=R=>{const n=mem(R).length;mem(R).forEach(w=>send(w,{t:'lobby',n}))};
wss.on('connection',ws=>{ws.alive=true;ws.on('pong',()=>ws.alive=true);
 ws.on('message',raw=>{let m;try{m=JSON.parse(raw)}catch(e){return}
  if(!ws.R){
   if(m.t==='host'){let c;do{c=String(1000+Math.floor(Math.random()*9000))}while(rooms.has(c));const R={code:c,p:[ws],started:false};rooms.set(c,R);ws.R=R;ws.slot=0;send(ws,{t:'room',code:c,slot:0,n:1})}
   else if(m.t==='join'){const R=rooms.get(String(m.code));if(!R)return send(ws,{t:'err',msg:'Комната не найдена'});if(R.started)return send(ws,{t:'err',msg:'Бой уже идёт'});let s=R.p.findIndex(x=>!x);if(s<0)s=R.p.length;if(s>=MAX)return send(ws,{t:'err',msg:'Комната заполнена (4/4)'});R.p[s]=ws;ws.R=R;ws.slot=s;send(ws,{t:'joined',slot:s,n:mem(R).length});lobby(R)}
   return}
  const R=ws.R;
  if(m.t==='start'){if(ws.slot===0&&!R.started&&mem(R).length>1){R.started=true;const ids=R.p.map((w,i)=>w?i:-1).filter(i=>i>=0);R.p.forEach((w,i)=>w&&send(w,{t:'ready',n:ids.length,slot:i,ids}))}return}
  if(!R.started)return;m.f=ws.slot;const s=JSON.stringify(m);R.p.forEach(w=>{if(w&&w!==ws&&w.readyState===1)w.send(s)})});
 ws.on('close',()=>{const R=ws.R;if(!R)return;R.p[ws.slot]=null;const rest=mem(R);
  if(!rest.length){rooms.delete(R.code);return}
  if(R.started)rest.forEach(w=>send(w,{t:'left',f:ws.slot}));
  else if(ws.slot===0){rest.forEach(w=>{send(w,{t:'err',msg:'Хост вышел'});w.R=null});rooms.delete(R.code)}
  else lobby(R)})});
setInterval(()=>wss.clients.forEach(w=>{if(!w.alive)return w.terminate();w.alive=false;w.ping()}),25000);
server.listen(PORT,'0.0.0.0',()=>console.log('listening',PORT));
