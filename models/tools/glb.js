// минимальное чтение/запись GLB (учитывает byteStride)
const fs=require('fs');
exports.read=f=>{const b=fs.readFileSync(f),jl=b.readUInt32LE(12),j=JSON.parse(b.slice(20,20+jl).toString()),bl=b.readUInt32LE(20+jl),bin=b.slice(28+jl,28+jl+bl);
 const acc=i=>{const a=j.accessors[i],bv=j.bufferViews[a.bufferView],n={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16}[a.type],T={5126:Float32Array,5125:Uint32Array,5123:Uint16Array,5121:Uint8Array}[a.componentType];
  const es=T.BYTES_PER_ELEMENT,stride=bv.byteStride||n*es,off=(bv.byteOffset||0)+(a.byteOffset||0),out=new T(a.count*n),dv=new DataView(bin.buffer,bin.byteOffset);
  const rd={5126:o=>dv.getFloat32(o,true),5125:o=>dv.getUint32(o,true),5123:o=>dv.getUint16(o,true),5121:o=>dv.getUint8(o)}[a.componentType];
  for(let k=0;k<a.count;k++)for(let c=0;c<n;c++)out[k*n+c]=rd(off+k*stride+c*es);return {n,count:a.count,data:out}};
 const img=i=>{const bv=j.bufferViews[j.images[i].bufferView];return bin.slice(bv.byteOffset||0,(bv.byteOffset||0)+bv.byteLength)};
 return {j,bin,acc,img}};
// writer: chunks = [{data:TypedArray|Buffer, target?}] -> bufferViews in order
exports.write=(f,j,chunks)=>{const parts=[];let off=0;j.bufferViews=[];
 chunks.forEach(c=>{const d=Buffer.isBuffer(c.data)?c.data:Buffer.from(c.data.buffer,c.data.byteOffset,c.data.byteLength);const pad=(4-off%4)%4;if(pad){parts.push(Buffer.alloc(pad));off+=pad}
  const bv={buffer:0,byteOffset:off,byteLength:d.length};if(c.target)bv.target=c.target;j.bufferViews.push(bv);parts.push(d);off+=d.length});
 let nb=Buffer.concat(parts);nb=Buffer.concat([nb,Buffer.alloc((4-nb.length%4)%4)]);j.buffers=[{byteLength:nb.length}];
 let js=Buffer.from(JSON.stringify(j));js=Buffer.concat([js,Buffer.from(' '.repeat((4-js.length%4)%4))]);
 const h=Buffer.alloc(12);h.write('glTF',0);h.writeUInt32LE(2,4);h.writeUInt32LE(28+js.length+nb.length,8);
 const c1=Buffer.alloc(8);c1.writeUInt32LE(js.length,0);c1.write('JSON',4);const c2=Buffer.alloc(8);c2.writeUInt32LE(nb.length,0);c2.writeUInt32LE(0x004E4942,4);
 fs.writeFileSync(f,Buffer.concat([h,c1,js,c2,nb]))};
