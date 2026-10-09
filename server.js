// Сервер-ретранслятор для дуэли 1x1: раздаёт игру и пересылает сообщения между двумя игроками в комнате.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 3000;
const HTML = path.join(__dirname, 'index.html');

const server = http.createServer((req, res) => {
  if (req.url === '/health') { res.writeHead(200); return res.end('ok'); }
  fs.readFile(HTML, (err, data) => {
    if (err) { res.writeHead(500); return res.end('index.html not found'); }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
    res.end(data);
  });
});

const wss = new WebSocketServer({ server, maxPayload: 16 * 1024 });
const rooms = new Map(); // code -> { host, guest }

function newCode() {
  for (let i = 0; i < 50; i++) {
    const c = String(1000 + Math.floor(Math.random() * 9000));
    if (!rooms.has(c)) return c;
  }
  return null;
}
const send = (ws, o) => { if (ws && ws.readyState === 1) ws.send(JSON.stringify(o)); };

wss.on('connection', (ws) => {
  ws.alive = true;
  ws.on('pong', () => { ws.alive = true; });
  ws.room = null;
  ws.on('message', (raw, isBinary) => {
    if (isBinary) return;
    const text = raw.toString();
    let m; try { m = JSON.parse(text); } catch { return; }
    if (m.t === 'host' && !ws.room) {
      const code = newCode();
      if (!code) return send(ws, { t: 'err', msg: 'Нет свободных комнат' });
      rooms.set(code, { host: ws, guest: null });
      ws.room = code; ws.role = 'host';
      return send(ws, { t: 'room', code });
    }
    if (m.t === 'join' && !ws.room) {
      const r = rooms.get(String(m.code || '').trim());
      if (!r) return send(ws, { t: 'err', msg: 'Комната не найдена' });
      if (r.guest) return send(ws, { t: 'err', msg: 'Комната уже занята' });
      r.guest = ws; ws.room = String(m.code).trim(); ws.role = 'guest';
      send(r.host, { t: 'ready' }); send(ws, { t: 'ready' });
      return;
    }
    if (!ws.room) return;
    const r = rooms.get(ws.room); if (!r) return;
    const peer = ws.role === 'host' ? r.guest : r.host;
    if (peer && peer.readyState === 1) peer.send(text);
  });
  ws.on('close', () => {
    if (!ws.room) return;
    const r = rooms.get(ws.room); if (!r) return;
    const peer = ws.role === 'host' ? r.guest : r.host;
    send(peer, { t: 'left' });
    rooms.delete(ws.room);
    if (peer) peer.room = null;
  });
});

setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.alive) return ws.terminate();
    ws.alive = false; ws.ping();
  });
}, 20000);

server.listen(PORT, () => console.log('listening on ' + PORT));
