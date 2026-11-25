# 2. Контракт героя: `{g, cast, u}`

Каждый облик героя создаётся функцией-фабрикой (например `makeArchmage()` в `build/heroes4.js`). Она возвращает объект:

```js
return {
  g,               // THREE.Group — корень модели. Движок кладёт его в группу игрока и вращает/двигает её.
  cast(v){ ... },  // момент каста. v — необязательное число 0.6..0.9 («сила/длина» жеста) или undefined.
  u(t, mv){ ... }  // каждый кадр. t — время в СЕКУНДАХ (performance.now()/1000), mv — true, если герой идёт.
};
```

Других полей движок у облика мага **не читает**. (У других героев бывает необязательное `pose(...)` — вызывается как `M.pose && M.pose(...)`, можно не делать.)

## Кто вызывает

```js
// свой каст (кнопка умения i):
function cast(i){ ...; mage.cast && mage.cast(); netSend({t:'c',c:cls,k:korSk,i,x:P.position.x,z:P.position.z,y:yaw}); doCast(ME,i) }
// чужой каст (пришёл по сети) → castFX(o,i) → o.cm.cast()
// внутри умений:  MO(o).cast(.8)      где MO = o => o===ME ? mage : o.cm
// каждый кадр для себя:  mage.u(now, mv.lengthSq()>0)
```

`mage` — облик своего героя, `o.cm` — облик чужого игрока / манекена.

## Пример (реальный, сокращён): процедурный маг

```js
function makeArchmage(){
  const T=THREE, g=new T.Group(), B=new T.Group(); g.add(B);
  // ... строим тело из примитивов в B ...
  let ct=0, lt=0;
  return { g,
    cast(){ ct=.9 },
    u(t,mv){ const dt=Math.min(.1,Math.max(0,t-lt)); lt=t; ct=Math.max(0,ct-dt);
      const ca=Math.min(1,ct*4), w=mv?1:0;
      B.position.y=.3+Math.sin(t*1.8)*.14;   // левитация
      B.rotation.x=w*.12;                     // наклон при ходьбе
      aR.rotation.x=-.35-ca*.75;              // рука поднимается при касте
    } };
}
```

## Где заменяется облик

```js
let mage = makeArchmage(); P.add(mage.g);        // свой герой
const dum = makeArchmage();                      // манекен-мишень
[DU2,DU3].forEach(D=>{ D.dm = makeArchmage() }); // другие игроки
// смена класса:
mage = c==4?BLKM : c==3?KORM[korSk] : c==2?NIN : c?SWM : SK[skI];
D.cm = c==4?BLK.model() : c==3?KOR.model(k) : c==2?armNinja(makeShinobi(2.4)) : c?SWX.model() : (D.dm||dum);
```

**Самый простой способ (путь А):** обернуть существующую фабрику — `makeArchmage = function(){ const o=_old(); ...добавить .glb в o.g...; return o }`. Так сделан маг из Hi3D, код — в `06_glb_template.md`.
