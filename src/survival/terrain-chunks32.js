import * as THREE from 'three';
/** Frustum-cull small patches, never alter the shared physical triangles or normals. */
export function terrainChunks32(source,segments,material,cells=64){
 const root=new THREE.Group();root.name='Textured island terrain · exact triangle patches';root.material=material;
 for(let z=0;z<segments;z+=cells)for(let x=0;x<segments;x+=cells){const nx=Math.min(cells,segments-x),nz=Math.min(cells,segments-z),geometry=new THREE.BufferGeometry();
  for(const [name,attribute]of Object.entries(source.attributes)){const array=new attribute.array.constructor((nx+1)*(nz+1)*attribute.itemSize);let offset=0;for(let j=0;j<=nz;j++){const begin=((z+j)*(segments+1)+x)*attribute.itemSize,row=attribute.array.subarray(begin,begin+(nx+1)*attribute.itemSize);array.set(row,offset);offset+=row.length;}geometry.setAttribute(name,new THREE.BufferAttribute(array,attribute.itemSize,attribute.normalized));}
  const indices=[];for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+nx+1,c=b+1,d=a+1;indices.push(a,b,d,b,c,d);}geometry.setIndex(indices);geometry.computeBoundingSphere();geometry.computeBoundingBox();const mesh=new THREE.Mesh(geometry,material);mesh.name='Terrain patch '+x+':'+z;mesh.receiveShadow=true;mesh.userData.sourceCells32={x,z,nx,nz};mesh.matrixAutoUpdate=false;root.add(mesh);
 }
 return root;
}
