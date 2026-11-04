import {module25} from './attachments25.js';
import * as THREE from "three";
const V = THREE.Vector3;
/** Small, bounded presentation-only pool. Never enters target selection or the ammo inventory. */
export function createEffects14(world) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const c = canvas.getContext("2d"),
    g = c.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,220,1)");
  g.addColorStop(0.13, "rgba(255,227,156,.96)");
  g.addColorStop(0.4, "rgba(255,149,55,.35)");
  g.addColorStop(1, "rgba(255,119,35,0)");
  c.fillStyle = g;
  c.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
      side: THREE.DoubleSide,
    }),
    flashes = [];
  for (const [id, m] of Object.entries(world.weaponViews)) {
    if (id === "rocketLauncher") continue;
    const short = ["pistol", "heavyPistol", "revolver"].includes(id),
      flash = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.13), material);
    if(m.userData.muzzle16)flash.position.fromArray(m.userData.muzzle16);else flash.position.set(0, 0.15, short ? -0.385 : -0.845);
    flash.layers.set(1);
    flash.visible = false;
    m.add(flash);
    m.userData.flash14 = flash;
    flashes.push(flash);
  }
  const mesh = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.006, 0.006, 0.033, 8).rotateX(Math.PI / 2),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.55,
      roughness: 0.48,
    }),
    8,
  );
  mesh.name = "DEV14 visual spent casings";
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.layers.set(1);
  mesh.frustumCulled = false;
  mesh.visible = false;
  world.camera.add(mesh);
  const matrix = new THREE.Matrix4().makeScale(.000001, .000001, .000001).setPosition(0,-10000,0);
  for (let i = 0; i < 8; i++) {
    mesh.setMatrixAt(i, matrix);
    mesh.setColorAt(i, new THREE.Color(0xb19a5c));
  }
  return {
    mesh,
    flashes,
    pending: [],
    particles: Array.from({ length: 8 }, () => ({
      age: 1,
      p: new V(),
      v: new V(),
      spin: 0,
      width: 1,
      length: 1,
    })),
    head: 0,
    serial: 0,
    matrix,
    q: new THREE.Quaternion(),
    p: new V(),
    scale: new V(),
  };
}
export function queueCasing14(world, id) {
  const fx = world.effects14;
  if (!fx || ["rocketLauncher", "revolver"].includes(id)) return;
  const delay =
    id === "shotgun"
      ? 0.22
      : id === "boltRifle"
        ? 0.25
        : id === "rifle"
          ? 0.12
          : 0;
  if (fx.pending.length < 8) fx.pending.push({ id, age: 0, delay });
}
export function updateEffects14(world, dt, selected, shotAge) {
  const fx = world.effects14;
  if (!fx) return;
  for (const [id, m] of Object.entries(world.weaponViews)) {
    const flash = m.userData.flash14;
    if (flash) {
      flash.visible = id === selected && shotAge < 0.055 && !['suppressor','flashHider'].includes(module25(world.state04,id,1));
      flash.rotation.z = fx.serial * 2.399;
      flash.scale.setScalar(0.6 + Math.sin(shotAge * 87) ** 2 * 0.55);
    }
  }
  for (const e of fx.pending) {
    e.age += dt;
    if (e.age < e.delay) continue;
    const model = world.weaponViews[e.id];
    if (e.id === selected && model?.visible) {
      const slot = fx.head++ % 8,
        particle = fx.particles[slot],
        shotgun = ["shotgun", "combatShotgun"].includes(e.id);
      particle.width = shotgun ? 1.45 : 1;
      particle.length = shotgun
        ? 1.65
        : ["pistol", "heavyPistol", "smg"].includes(e.id)
          ? 0.7
          : 1.4;
      fx.mesh.setColorAt(slot, new THREE.Color(shotgun ? 0x985c43 : 0xb19a5c));
      fx.mesh.instanceColor.needsUpdate = true;
      particle.age = 0;
      particle.spin = ++fx.serial * 2.399;
      particle.p.set(0.1, 0.15, -0.08);
      model.localToWorld(particle.p);
      particle.v
        .set(
          1.3 + Math.sin(particle.spin) * 0.35,
          1.05 + Math.cos(particle.spin) * 0.25,
          0.28,
        )
        .applyQuaternion(world.camera.quaternion);
    }
    e.done = true;
  }
  fx.pending = fx.pending.filter((e) => !e.done);
  let active = false;
  for (let i = 0; i < 8; i++) {
    const e = fx.particles[i];
    e.age += dt;
    if (e.age > 0.65) {
      fx.matrix.makeScale(.000001, .000001, .000001).setPosition(0,-10000,0);
    } else {
      active = true;
      e.v.y -= 9.81 * dt;
      e.p.addScaledVector(e.v, dt);
      fx.p.copy(e.p);
      world.camera.worldToLocal(fx.p);
      if(!Number.isFinite(fx.p.x+fx.p.y+fx.p.z)||fx.p.z>-.10){e.age=1;fx.mesh.setMatrixAt(i,fx.matrix.makeScale(.000001,.000001,.000001).setPosition(0,-10000,0));continue;}
      fx.q.setFromEuler(
        new THREE.Euler(e.spin + e.age * 13, e.age * 9, e.age * 17),
      );
      const fade = Math.min(1, (0.65 - e.age) / 0.12);
      fx.scale.set(e.width * fade, e.width * fade, e.length * fade);
      fx.matrix.compose(fx.p, fx.q, fx.scale);
    }
    fx.mesh.setMatrixAt(i, fx.matrix);
  }
  fx.mesh.visible = active;
  fx.mesh.instanceMatrix.needsUpdate = true;
}
