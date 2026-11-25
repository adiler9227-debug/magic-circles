// Заменить картинку №N внутри .glb на другой JPEG, ничего больше не трогая.
// node tools/retex.js in.glb out.glb 0 new.jpg
const fs = require('fs');
const [, , IN, OUT, IDX, JPG] = process.argv;
const b = fs.readFileSync(IN), jl = b.readUInt32LE(12), j = JSON.parse(b.slice(20, 20 + jl).toString()), bl = b.readUInt32LE(20 + jl), bin = b.slice(28 + jl, 28 + jl + bl);
const target = j.images[+IDX].bufferView, newImg = fs.readFileSync(JPG), parts = [];
let off = 0;
j.bufferViews.forEach((bv, i) => {
  const d = i === target ? newImg : bin.slice(bv.byteOffset || 0, (bv.byteOffset || 0) + bv.byteLength);
  const pad = (4 - off % 4) % 4; if (pad) { parts.push(Buffer.alloc(pad)); off += pad; }
  bv.byteOffset = off; bv.byteLength = d.length; parts.push(d); off += d.length;
});
let nb = Buffer.concat(parts); nb = Buffer.concat([nb, Buffer.alloc((4 - nb.length % 4) % 4)]); j.buffers[0].byteLength = nb.length;
let js = Buffer.from(JSON.stringify(j)); js = Buffer.concat([js, Buffer.from(' '.repeat((4 - js.length % 4) % 4))]);
const h = Buffer.alloc(12); h.write('glTF', 0); h.writeUInt32LE(2, 4); h.writeUInt32LE(28 + js.length + nb.length, 8);
const c1 = Buffer.alloc(8); c1.writeUInt32LE(js.length, 0); c1.write('JSON', 4);
const c2 = Buffer.alloc(8); c2.writeUInt32LE(nb.length, 0); c2.writeUInt32LE(0x004E4942, 4);
fs.writeFileSync(OUT, Buffer.concat([h, c1, js, c2, nb]));
console.log(OUT, fs.statSync(OUT).size);
