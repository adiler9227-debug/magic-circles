# 1. Движок и сборка

- Язык: **обычный JavaScript** (без TypeScript, React, Vite, модулей `import`).
- 3D: **three.js r128** с CDN, всё глобально: `THREE.*`. Подключены только:
  - `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`
  - `https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js`
  - (DRACOLoader, KTX2, meshopt, SkeletonUtils — **НЕ подключены**.)
- Вся игра — один файл `index.html` (~5 МБ). Сервер — Node.js `server.js` + пакет `ws`.
- Репозиторий: GitHub `adiler9227-debug/magic-circles`, ветка `graphics-v4`. Папка у владельца: `C:\Users\User\ИГРАМОЯ\magic-circles`.

## Правило №1: `index.html` руками не править

Он собирается командой:
```
node build/apply-fx3.js
```
Сборщик берёт чистый исходник из git-коммита `66b07f4`, вставляет модели героев из `build/heroes4.js`, делает точечные замены `R(старое, новое, 'имя')` (каждая должна найтись ровно 1 раз) и модуль эффектов `build/fx3.js`.

Куда писать код:
- **внешний вид героя** → `build/heroes4.js` (в конец файла);
- **замена строки в движке** → новая `R(...)` в `build/apply-fx3.js`;
- **эффекты** → `build/fx3.js`.

Новый файл (например `hero.glb`) кладётся в корень проекта **и** добавляется в `FILES` в `server.js` (см. `05_network.md`), иначе сервер отдаст 404.

## Рендерер — важно для цветов

- `outputEncoding` у рендерера **не задан** (линейный). Поэтому у текстур из .glb нужно ставить `map.encoding = THREE.LinearEncoding`, иначе модель будет темнее остальных.
- Тени включены на хороших устройствах (`castShadow = true` у мешей).
- В r128 нет `getComponent` у атрибутов, нет `colorSpace` — только `encoding`.
