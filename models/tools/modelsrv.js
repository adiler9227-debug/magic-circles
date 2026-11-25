// Просмотрщик моделей: node models/tools/modelsrv.js → http://localhost:8765/grid.html?f=sword_game.glb
const h=require('http'),fs=require('fs'),p=require('path');
const root=p.join(__dirname,'..');   // папка models
h.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/view.html';
 const f=p.join(root,p.normalize(u));if(!f.startsWith(root)){r.writeHead(403);return r.end()}
 fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end()}r.writeHead(200,{'Content-Type':f.endsWith('.html')?'text/html; charset=utf-8':'application/octet-stream'});r.end(d)})
}).listen(8765,'127.0.0.1');
