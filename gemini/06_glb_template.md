# 6. Требования к .glb и рабочий шаблон

## Требования к файлу (проверено на three.js r128 + GLTFLoader)

| Что | Нужно |
|---|---|
| Формат | `.glb` (glTF 2.0, бинарный, всё внутри одного файла) |
| Треугольники | ≤ 30 000 (маг: 30 000) |
| Размер файла | ≤ 2 МБ (маг: 1.27 МБ) |
| Текстуры | JPEG/PNG, цвет ≤ 1024×1024, metallicRoughness ≤ 512. **Без WebP, KTX2, Draco, meshopt** (декодеры не подключены) |
| Материал | один `MeshStandardMaterial` (PBR) — нормально |
| Скелет | обычный glTF skin, ≤ 4 влияния на вершину. Имена костей уникальные |
| Анимации | клипы с понятными именами. У мага: `cast_hand` (~1.0 с), `cast_staff` (~1.25 с). Длительность 0.8–1.5 с, начинаются и заканчиваются в позе покоя |
| Ходьба | **не нужна** — левитация кодом |
| Поза покоя | стоя, лицом в +Z, ноги внизу (масштаб/сдвиг делает код) |
| Оружие | лучше на кости кисти целиком (не гнётся) |

Проверка файла: `npx @gltf-transform/cli validate hero.glb` (должно быть «No errors»). Упрощение: `weld` → `simplify --ratio 0.015 --error 0.002`.

Как делали мага: Hi3D (картинка → 3D, ~45 кредитов) → упрощение gltf-transform → скелет, веса и анимации скриптом `models/tools/rig.js` (Node.js, без Blender) → уменьшение текстуры `models/tools/retex.js`. Можно и через Mixamo/Blender — главное, чтобы итог соответствовал таблице.

## Рабочий код (стоит в игре сейчас, конец `build/heroes4.js`)

Для нового облика скопируй, замени `mage.glb` / `makeArchmage` / имена клипов.

```js
// Файл качается и разбирается ОДИН раз; копии делят геометрию и текстуру, у каждой свой скелет.
const MAGE_GLB=(()=>{let tpl=null,q=[];const T=THREE;
 const ready=gl=>{gl.scene.traverse(m=>{if(!m.isMesh)return;m.frustumCulled=false;m.castShadow=true;const mt=m.material;
   if(mt){if(mt.map)mt.map.encoding=T.LinearEncoding;mt.metalness=Math.min(mt.metalness,.35);mt.needsUpdate=true}});
  tpl=gl;q.splice(0).forEach(f=>{try{f(gl)}catch(e){}});setTimeout(()=>{try{R.compile(S,C)}catch(e){}},0)}; // прогрев шейдера
 try{fetch("mage.glb").then(r=>r.ok?r.arrayBuffer():null).then(b=>{if(b&&T.GLTFLoader)new T.GLTFLoader().parse(b,"",ready,()=>{})}).catch(()=>{})}catch(e){}
 return f=>{if(tpl)f(tpl);else q.push(f)}})();

// копия со своим скелетом (замена SkeletonUtils.clone, которого нет в r128-сборке)
function cloneSkinned(src){const c=src.clone(true),bones={};c.traverse(o=>{if(o.isBone)bones[o.name]=o});
 c.traverse(o=>{if(o.isSkinnedMesh){const sk=o.skeleton;o.bind(new THREE.Skeleton(sk.bones.map(b=>bones[b.name]),sk.boneInverses),o.bindMatrix)}});return c}

// обёртка над старым обликом: пока .glb грузится (или не загрузился) — виден старый
const _makeArchmageProc=makeArchmage;
makeArchmage=function(){const o=_makeArchmageProc(),T=THREE,g=o.g,B=g.children[0],W=new T.Group();let M=null,mixer=null,acts={},lt=0,alt=0;
 MAGE_GLB(gl=>{M=cloneSkinned(gl.scene);
  const b=new T.Box3().setFromObject(M),s=6.2/((b.max.y-b.min.y)||1);M.scale.setScalar(s);M.position.y=-b.min.y*s;
  W.add(M);g.add(W);B.visible=false;
  mixer=new T.AnimationMixer(M);gl.animations.forEach(a=>{const ac=mixer.clipAction(a);ac.setLoop(T.LoopOnce,1);ac.clampWhenFinished=false;acts[a.name]=ac})});
 const c0=o.cast,u0=o.u;
 o.cast=function(v){c0.apply(o,arguments);if(!mixer)return;const a=acts[(alt++%2)?"cast_staff":"cast_hand"];if(!a)return;
  for(const k in acts)if(acts[k]!==a)acts[k].fadeOut(.1);a.reset().fadeIn(.06).play()};
 o.u=function(t,mv){u0.apply(o,arguments);if(!M)return;const dt=Math.min(.1,Math.max(0,t-lt));lt=t;mixer.update(dt);
  W.position.y=.3+Math.sin(t*1.8)*.14;W.rotation.x=mv?.12:0};   // левитация и наклон — кодом
 return o};
```

Замечания:
- `R`, `S`, `C` — глобальные рендерер, сцена, камера игры.
- Для другого героя (например мечника) оборачивай `makeSaint` так же. Обёртка должна стоять **в `build/heroes4.js`**: он вставляется в начало скрипта, а `SWX` позже запоминает ссылку `model: makeSaint` — так подхватится уже обёрнутая версия. Возвращай тот же объект `o` (движок мечника читает его поля). `B=g.children[0]` — у процедурных героев это группа тела. Проверь, что после `B.visible=false` не остаются видимыми лишние части (у некоторых героев есть дополнительные объекты в `g`).
- После правок: `node build/apply-fx3.js` → открыть локально `node server.js` (порт 3000) → режим «Тесты» → проверить каст и FPS.
