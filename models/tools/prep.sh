# Подготовка модели из Hi3D: сварка, упрощение, текстуры 1024/512.  sh tools/prep.sh omni_hi3d.glb omni_game.glb  (из папки models)
set -e
IN=$1; OUT=$2; T=_prep
npx -y @gltf-transform/cli@4.1.1 weld $IN ${T}_w.glb
npx -y @gltf-transform/cli@4.1.1 simplify ${T}_w.glb ${T}_s.glb --ratio 0.015 --error 0.002
node -e "const {read}=require('./tools/glb.js'),fs=require('fs'),g=read('${T}_s.glb');g.j.images.forEach((_,i)=>fs.writeFileSync('${T}_img'+i+'.jpg',g.img(i)))"
powershell -NoProfile -File tools/resize.ps1 ${T}_img0.jpg ${T}_c.jpg 1024 88
powershell -NoProfile -File tools/resize.ps1 ${T}_img1.jpg ${T}_m.jpg 512 85
node tools/retex.js ${T}_s.glb ${T}_t.glb 0 ${T}_c.jpg
node tools/retex.js ${T}_t.glb $OUT 1 ${T}_m.jpg
rm -f ${T}_w.glb ${T}_t.glb ${T}_img*.jpg ${T}_c.jpg ${T}_m.jpg
ls -la $OUT
