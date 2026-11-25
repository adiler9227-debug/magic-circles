# 5. Сеть и FILES

## Что летит по WebSocket

Сервер (`server.js`) — простой ретранслятор комнат до 4 игроков. Облик героя по сети **не передаётся** — только номер класса. Каждый клиент сам строит облик по номеру.

**Каст** (клиент → всем в комнате):
```js
netSend({t:'c', c:cls, k:korSk, i, x:P.position.x, z:P.position.z, y:yaw});
// c — ID класса (0..4), k — скин Коробаса (0/1), i — номер умения (0..10), x/z — позиция, y — поворот
```
Приём:
```js
else if(m.t==='c'){
  if(m.c!==D.cl || (m.c===3 && (m.k?1:0)!==D.ks)) setDUCls(m.c, D, m.k);   // сменить облик чужого игрока
  D.g.position.set(m.x,0,m.z); D.yaw=m.y; doCast(D, m.i);                // повторить каст у себя
}
```
Положение игроков идёт отдельными сообщениями состояния, в них тоже есть `c` (класс) — при расхождении так же зовётся `setDUCls`.

**Выбор класса в лобби**: `{t:'cls', c}` → сервер: `ws.cls = freeC(R, m.c, ws)` (не даёт двум игрокам один класс).

```js
// server.js — ограничение номеров классов 0..4 (для 6-го героя поменять!)
const freeC=(R,c,ws)=>{c=(c|0);if(c<0||c>4)c=0;const used=new Set(mem(R).filter(w=>w!==ws).map(w=>w.cls));if(!used.has(c))return c;for(let k=0;k<5;k++)if(!used.has(k))return k;return c};
```

Вывод: **новый облик (путь А) сеть не трогает вообще** — у всех клиентов загрузится тот же .glb.

## FILES — какие файлы отдаёт сервер (полностью)

```js
const FILES={'/':['index.html','text/html; charset=utf-8'],'/index.html':['index.html','text/html; charset=utf-8'],
 '/manifest.json':['manifest.json','application/manifest+json'],'/sw.js':['sw.js','text/javascript'],
 '/icon-192.png':['icon-192.png','image/png'],'/icon-512.png':['icon-512.png','image/png'],
 '/vfx/vfx.js':['vfx/vfx.js','text/javascript'],'/vfx/skins.js':['vfx/skins.js','text/javascript'],
 '/bh.glb':['bh.glb','model/gltf-binary'],'/mage.glb':['mage.glb','model/gltf-binary']};
```
Новый файл добавить так же: `'/hero.glb':['hero.glb','model/gltf-binary']`. Сервер сам сжимает (gzip) и кэширует (ETag). Service worker ничего не кэширует.

## Выкатка (только после «да» владельца)
```
cd /opt/magic-circles && git fetch origin && git reset --hard origin/graphics-v4 && systemctl restart magic
```
