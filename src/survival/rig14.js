import * as THREE from "three";
const V = THREE.Vector3,
  Y = new V(0, 1, 0),
  clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
/** Original continuous lofts, anatomical proportions and skeletal skinning; no downloaded hand mesh. */
function loft(profile, material, sides = 20) {
  const p = [],
    uv = [],
    idx = [];
  const first = profile[0][0],
    last = profile.at(-1)[0];
  for (let j = 0; j < profile.length; j++) {
    const [y, w, d, z = 0, x = 0] = profile[j];
    for (let i = 0; i <= sides; i++) {
      const a = (i / sides) * Math.PI * 2;
      p.push(x + Math.cos(a) * w, y, z + Math.sin(a) * d);
      uv.push(i / sides, (y - first) / Math.max(0.001, last - first));
    }
  }
  for (let j = 0; j < profile.length - 1; j++)
    for (let i = 0; i < sides; i++) {
      const a = j * (sides + 1) + i,
        b = a + 1;
      idx.push(a, a + sides + 1, b, b, a + sides + 1, b + sides + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return new THREE.Mesh(g, material);
}
function texture14(kind) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const x = c.getContext("2d"),
    im = x.createImageData(256, 256);
  let seed = 0x14ab3;
  for (let j = 0; j < 256; j++)
    for (let i = 0; i < 256; i++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const n = seed / 4294967296 - 0.5,
        woven = ((i % 4 === 0 ? 1 : 0) + (j % 4 === 0 ? 1 : 0)) * 0.5;
      let v =
        kind === "skin"
          ? 208 + n * 16
          : kind === "leather"
            ? 206 + n * 27
            : 205 + n * 12 + woven * 21;
      const a = (j * 256 + i) * 4;
      im.data[a] = im.data[a + 1] = im.data[a + 2] = v;
      im.data[a + 3] = 255;
    }
  x.putImageData(im, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.NoColorSpace;
  return t;
}
export function handMaterials14() {
  const skin = texture14("skin"),
    leather = texture14("leather"),
    cloth = texture14("cloth");
  return {
    skin: new THREE.MeshStandardMaterial({
      color: 0xc39982,
      roughness: 1,
      roughnessMap: skin,
      bumpMap: skin,
      bumpScale: 0.00035,
      envMapIntensity: 0.4,
    }),
    glove: new THREE.MeshStandardMaterial({
      color: 0x454c42,
      roughness: 1,
      roughnessMap: leather,
      bumpMap: leather,
      bumpScale: 0.00065,
      envMapIntensity: 0.3,
    }),
    cloth: new THREE.MeshStandardMaterial({
      color: 0x606b58,
      roughness: 1,
      roughnessMap: cloth,
      bumpMap: cloth,
      bumpScale: 0.0008,
      envMapIntensity: 0.25,
    }),
    seam: new THREE.MeshStandardMaterial({ color: 0x818875, roughness: 1 }),
    nail: new THREE.MeshStandardMaterial({
      color: 0xc2a390,
      roughness: 0.57,
      envMapIntensity: 0.3,
    }),
  };
}
function skinGeometry(g, joints, blend) {
  const index = [],
    weight = [];
  for (let i = 0; i < g.attributes.position.count; i++) {
    const y = g.attributes.position.getY(i);
    let a = 0,
      b = 0,
      t = 0;
    for (let j = 0; j < joints.length; j++)
      if (y > joints[j] - blend) {
        a = j;
        b = j + 1;
        t = smooth(joints[j] - blend, joints[j] + blend, y);
      }
    index.push(a, b, 0, 0);
    weight.push(1 - t, t, 0, 0);
  }
  g.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(index, 4));
  g.setAttribute("skinWeight", new THREE.Float32BufferAttribute(weight, 4));
}
function finger14(length, radius, mats, thumb = false) {
  const profile = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20,
      tip = 1 - smooth(0.8, 1, t),
      pad = 0.92 + 0.08 * Math.sin(t * Math.PI),
      crease =
        1 -
        0.07 * Math.exp(-(((t - 0.43) / 0.045) ** 2)) -
        0.06 * Math.exp(-(((t - 0.75) / 0.045) ** 2));
    profile.push([
      t * length,
      Math.max(0.0007, radius * pad * crease * Math.sqrt(tip)),
      Math.max(0.0007, radius * 0.88 * pad * Math.sqrt(tip)),
    ]);
  }
  const raw = loft(profile, mats.skin, 16),
    g = raw.geometry;
  skinGeometry(g, [length * 0.43, length * 0.75], length * 0.075);
  const bones = [new THREE.Bone(), new THREE.Bone(), new THREE.Bone()];
  bones[0].add(bones[1]);
  bones[1].position.y = length * 0.43;
  bones[1].add(bones[2]);
  bones[2].position.y = length * 0.32;
  const mesh = new THREE.SkinnedMesh(g, mats.skin);
  mesh.add(bones[0]);
  mesh.bind(new THREE.Skeleton(bones));
  mesh.frustumCulled = false;
  const nail = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), mats.nail);
  nail.scale.set(radius * 0.65, length * (thumb ? 0.095 : 0.085), 0.0013);
  nail.position.set(0, length * 0.15, -radius * 0.74);
  bones[2].add(nail);
  return { mesh, bones, spread: 0 };
}
export function createHand14(side, mats) {
  const root = new THREE.Group();
  root.name =
    side > 0 ? "Right anatomical hand DEV14" : "Left anatomical hand DEV14";
  const palm = loft(
    [
      [-0.045, 0.029, 0.022, 0.012],
      [-0.025, 0.033, 0.024, 0.012],
      [0, 0.039, 0.026, 0.012],
      [0.035, 0.045, 0.025, 0.011],
      [0.073, 0.044, 0.023, 0.009],
      [0.099, 0.039, 0.019, 0.008],
      [0.108, 0.03, 0.012, 0.006],
      [0.111, 0.002, 0.003, 0.006],
    ],
    mats.skin,
  );
  root.add(palm);
  const glove = loft(
    [
      [-0.048, 0.031, 0.024, 0.012],
      [-0.02, 0.035, 0.026, 0.012],
      [0.02, 0.042, 0.027, 0.011],
      [0.058, 0.046, 0.025, 0.009],
      [0.086, 0.043, 0.022, 0.008],
    ],
    mats.glove,
  );
  root.add(glove);
  // A single curved dorsal panel, not a stack of blocks at the knuckles.
  const panel = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), mats.glove);
  panel.position.set(0, 0.051, -0.014);
  panel.scale.set(0.038, 0.036, 0.01);
  root.add(panel);
  const fingers = [];
  for (let i = 0; i < 4; i++) {
    const f = finger14(
      [0.077, 0.086, 0.08, 0.064][i],
      [0.0107, 0.0114, 0.0105, 0.0094][i],
      mats,
    );
    f.mesh.position.set(
      (0.032 - i * 0.021) * side,
      0.092 + (i === 1 ? 0.005 : i === 3 ? -0.008 : 0),
      0.006,
    );
    f.spread = (i - 1.5) * -0.045 * side;
    root.add(f.mesh);
    fingers.push(f);
  }
  const thumb = finger14(0.064, 0.013, mats, true);
  thumb.mesh.position.set(0.043 * side, 0.025, 0.016);
  thumb.mesh.rotation.set(0.32, 0.22 * side, 0.92 * side);
  root.add(thumb.mesh);
  fingers.push(thumb);
  root.userData.fingers = fingers;
  root.userData.wrist14 = new V(0, -0.037, 0.012);
  root.userData.side14 = side;
  root.traverse((o) => {
    o.layers.set(1);
    o.castShadow = false;
    o.receiveShadow = false;
  });
  return root;
}
export function poseHand14(hand, grip, index = 0.5, spread = 0, dt = 0.016) {
  const a = 1 - Math.exp(-25 * dt);
  hand.userData.fingers.forEach((f, i) => {
    for (let j = 0; j < 3; j++) {
      const target =
        i === 4
          ? [0.3, 0.61, 0.43][j] * grip
          : i === 0
            ? [0.53, 0.88, 0.48][j] * index
            : [0.88, 1.3, 0.78][j] * grip;
      f.bones[j].rotation.x += (target - f.bones[j].rotation.x) * a;
      f.bones[j].rotation.z +=
        ((j === 0 && i < 4
          ? f.spread * (1 - grip * 0.7) + spread * (i - 1.5)
          : 0) -
          f.bones[j].rotation.z) *
        a;
    }
  });
}
export function createArm14(side, mats) {
  const l1 = 0.36,
    l2 = 0.34,
    total = l1 + l2,
    root = new THREE.Group(),
    upper = new THREE.Bone(),
    lower = new THREE.Bone(),
    wrist = new THREE.Bone();
  upper.add(lower);
  lower.position.y = l1;
  lower.add(wrist);
  wrist.position.y = l2;
  upper.name = "UpperArm14";
  lower.name = "Forearm14";
  wrist.name = "Wrist14";
  const shell = loft(
    [
      [0, 0.067, 0.061],
      [0.07, 0.075, 0.065],
      [0.22, 0.063, 0.054],
      [l1 - 0.035, 0.052, 0.047],
      [l1, 0.05, 0.046],
      [l1 + 0.05, 0.054, 0.047],
      [total - 0.1, 0.043, 0.037],
      [total - 0.035, 0.035, 0.029],
      [total, 0.032, 0.026],
    ],
    mats.cloth,
    24,
  );
  skinGeometry(shell.geometry, [l1, total - 0.025], 0.045);
  const mesh = new THREE.SkinnedMesh(shell.geometry, mats.cloth);
  mesh.add(upper);
  mesh.bind(new THREE.Skeleton([upper, lower, wrist]));
  mesh.frustumCulled = false;
  root.add(mesh);
  const cuff = loft(
    [
      [-0.026, 0.034, 0.028],
      [-0.022, 0.036, 0.03],
      [0.008, 0.036, 0.029],
      [0.014, 0.033, 0.027],
    ],
    mats.glove,
    24,
  );
  wrist.add(cuff);
  const seam = new THREE.Mesh(
    new THREE.TorusGeometry(0.034, 0.0011, 4, 24),
    mats.seam,
  );
  seam.rotation.x = Math.PI / 2;
  seam.position.y = -0.016;
  wrist.add(seam);
  root.traverse((o) => {
    o.layers.set(1);
    o.castShadow = false;
    o.receiveShadow = false;
  });
  return {
    root,
    upper,
    lower,
    wrist,
    l1,
    l2,
    side,
    base: new V(side * 0.23, -0.28, -0.02),
    shoulder: new V(),
    goal: new V(),
    axis: new V(),
    pole: new V(),
    elbow: new V(),
    q1: new THREE.Quaternion(),
    q2: new THREE.Quaternion(),
    handQ: new THREE.Quaternion(),
    scratch: new V(),
  };
}
export function solveArm14(rig, hand, camera) {
  hand.updateWorldMatrix(true, false);
  rig.goal.copy(hand.userData.wrist14).applyMatrix4(hand.matrixWorld);
  camera.worldToLocal(rig.goal);
  hand.getWorldQuaternion(rig.handQ);
  rig.q2.copy(camera.quaternion).invert();
  rig.handQ.premultiply(rig.q2);
  rig.shoulder.copy(rig.base);
  rig.axis.copy(rig.goal).sub(rig.shoulder);
  let d = rig.axis.length();
  if (d < 0.0001) rig.axis.set(0, 0, -1);
  else rig.axis.multiplyScalar(1 / d);
  if (d < 0.03) {
    rig.shoulder.addScaledVector(rig.axis, d - 0.03);
    d = 0.03;
  }
  // Hidden camera-space shoulder compensation preserves segment lengths and wrist contact at extreme poses.
  const reach = rig.l1 + rig.l2 - 0.012,
    soft = 0.62;
  const excess =
    d > soft
      ? d - (soft + (reach - soft) * Math.tanh((d - soft) / (reach - soft)))
      : 0;
  rig.shoulder.addScaledVector(rig.axis, excess);
  d -= excess;
  const along = (rig.l1 ** 2 - rig.l2 ** 2 + d * d) / (2 * d),
    bend = Math.sqrt(Math.max(0.00001, rig.l1 ** 2 - along * along));
  rig.pole
    .set(rig.side * 0.55, -1, 0.15)
    .addScaledVector(rig.axis, -rig.pole.dot(rig.axis));
  if (rig.pole.lengthSq() < 0.00001)
    rig.pole.set(1, 0, 0).addScaledVector(rig.axis, -rig.axis.x);
  rig.pole.normalize();
  rig.elbow
    .copy(rig.shoulder)
    .addScaledVector(rig.axis, along)
    .addScaledVector(rig.pole, bend);
  rig.q1.setFromUnitVectors(
    Y,
    rig.scratch.copy(rig.elbow).sub(rig.shoulder).normalize(),
  );
  rig.q2.setFromUnitVectors(
    Y,
    rig.scratch.copy(rig.goal).sub(rig.elbow).normalize(),
  );
  rig.upper.position.copy(rig.shoulder);
  rig.upper.quaternion.copy(rig.q1);
  rig.lower.quaternion.copy(rig.q1).invert().multiply(rig.q2);
  rig.wrist.quaternion.copy(rig.q2).invert().multiply(rig.handQ);
}
export function disposeDetached14(roots) {
  const g = new Set(),
    m = new Set(),
    s = new Set();
  for (const root of roots.filter(Boolean)) {
    root.parent?.remove(root);
    root.traverse((o) => {
      if (o.geometry) g.add(o.geometry);
      if (o.skeleton) s.add(o.skeleton);
      for (const a of o.material
        ? Array.isArray(o.material)
          ? o.material
          : [o.material]
        : [])
        m.add(a);
    });
  }
  g.forEach((x) => x.dispose());
  m.forEach((x) => x.dispose());
  s.forEach((x) => x.dispose());
}
