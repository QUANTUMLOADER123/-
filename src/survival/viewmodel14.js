import {GUNS29} from './weapon-profiles29.js';
import * as THREE from "three";
import {medicalModel16} from "./items16.js";
import { isGun, WEAPONS } from "./catalog.js";
import {
  createHand14,
  createArm14,
  handMaterials14,
  poseHand14,
  solveArm14,
  disposeDetached14,
} from "./rig14.js";
import {
  GUN_POSES14,
  TOOL_POSES14,
  RIGHT14,
  LEFT14,
  LEFT_SIDE14,
  makeMotion14,
  clamp14,
  smooth14,
  track14,
  damp14,
  spring14,
} from "./pose14.js";
import {
  prepareReload14,
  resetMechanisms14,
  reloadPose14,
  fireMechanism14,
} from "./reload14.js";
import {
  createEffects14,
  queueCasing14,
  updateEffects14,
} from "./effects14.js";
const V = THREE.Vector3;
function tools14(w) {
  const medicine={};for(const id of ['syringe','medkit','antiseptic','traumaKit']){const m=medicalModel16(id);m.visible=false;m.traverse(o=>o.layers.set(1));w.handRoot.add(m);medicine[id]=m;}
  return {...medicine,
    rock: w.heldRock,
    axe: w.heldAxe,
    pickaxe: w.heldPickaxe,
    hammer: w.heldHammer,
    torch: w.heldTorch,
    plan: w.heldPlan,
    satchel: w.heldSatchel,
    ...w.explosiveViews04,
  };
}
function handleSocket14(model) {
  const box = new THREE.Box3(),
    inverse = new THREE.Matrix4();
  model.updateWorldMatrix(true, true);
  inverse.copy(model.matrixWorld).invert();
  model.traverse((o) => {
    if (
      !o.isMesh ||
      !/wood|handle|brown/i.test(
        (Array.isArray(o.material)
          ? o.material.map((m) => m.name).join(" ")
          : o.material?.name) || "",
      )
    )
      return;
    if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
    box.union(
      o.geometry.boundingBox
        .clone()
        .applyMatrix4(
          new THREE.Matrix4().multiplyMatrices(inverse, o.matrixWorld),
        ),
    );
  });
  if (box.isEmpty()) {
    model.traverse((o) => {
      if (!o.isMesh) return;
      if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
      box.union(
        o.geometry.boundingBox
          .clone()
          .applyMatrix4(
            new THREE.Matrix4().multiplyMatrices(inverse, o.matrixWorld),
          ),
      );
    });
  }
  return new V(
    (box.min.x + box.max.x) / 2,
    box.min.y + (box.max.y - box.min.y) * 0.3,
    (box.min.z + box.max.z) / 2,
  );
}
function selectVisible14(w, id, swim) {
  for (const [k, o] of Object.entries(w.weaponViews))
    o.visible = !swim && id === k;
  for (const [k, o] of Object.entries(w.viewTools14))
    o.visible = !swim && k === id;
  // Unknown belt items no longer masquerade as the starting rock.
  w.torchLight.intensity = !swim && id === "torch" ? 2.3 : 0;
}
function placeHand14(hand, p, q) {
  hand.position.copy(p);
  hand.quaternion.copy(q);
}
export function installViewmodel14(World) {
  const make = World.prototype.makeNewViewModels,
    update = World.prototype.update,
    dispose = World.prototype.dispose,
    prepare = World.prototype.prepareEntry11;
  World.prototype.makeNewViewModels = function () {
    make.call(this);
    disposeDetached14([
      this.rightHand04,
      this.leftHand04,
      ...(this.armRigs08 || []).map((r) => r.root),
    ]);
    this.armRigs08 = [];
    this.viewMaterials14 = handMaterials14();
    this.rightHand04 = createHand14(1, this.viewMaterials14);
    this.leftHand04 = createHand14(-1, this.viewMaterials14);
    this.handRoot.add(this.rightHand04, this.leftHand04);
    this.arms14 = [
      createArm14(1, this.viewMaterials14),
      createArm14(-1, this.viewMaterials14),
    ];
    for (const r of this.arms14) this.camera.add(r.root);
    this.viewTools14 = tools14(this);
    this.toolSockets14 = {};
    // Straight handles, then derive the wood/shaft grip from the authored model geometry.
    this.heldAxe.rotation.set(0, 0.2, 0);
    this.heldPickaxe.rotation.set(0, 0, 0);
    this.heldHammer.rotation.set(0, 0, 0);
    for (const id of ["axe", "pickaxe", "hammer", "torch"]) {
      const model = this.viewTools14[id];
      this.toolSockets14[id] = handleSocket14(model);
    }
    for (const [id, m] of Object.entries(this.weaponViews)) {
      m.position.set(-0.025, 0.12, -0.12);
      m.rotation.set(0, 0, 0);
      prepareReload14(m, id);
    }
    this.effects14 = createEffects14(this);
    this.motion14 = makeMotion14();
    this.viewmodel14 = true;
    this.viewWork14 = {
      p: new V(),
      q: new THREE.Quaternion(),
      left: new V(),
      right: new V(),
      leftQ: new THREE.Quaternion(),
      rightQ: new THREE.Quaternion(),
      optic: new V(),
      hip: new V(),
      ads: new V(),
    };
  };
  World.prototype.viewAction14 = function (
    kind,
    { id = this.state04?.selected, impact = 0 } = {},
  ) {
    const m = this.motion14;
    if (!m) return;
    if (kind === "fire") {
      m.action = null;
      m.lastShotId = id;
      queueCasing14(this, id);
      const kick = GUN_POSES14[id]?.kick || 0.7,
        steady = 1 - m.aim * 0.58;
      m.shotAge = 0;
      m.shotCount++;
      m.recoil.v = Math.min(13, m.recoil.v + kick * 7.4 * steady);
      m.push.v = Math.min(3, m.push.v + kick * 1.8 * steady);
      m.roll.v += Math.sign(WEAPONS[id]?.recoil17?.side||0) * kick * 0.8;
      m.equip = Math.max(m.equip, 0.7);
    } else if (kind === "land") {
      m.landing.v = Math.min(2, m.landing.v + Math.min(12, impact) * 0.07);
    } else {
      if (kind === "melee" || kind === "throw" || kind === "consume")
        m.equip = Math.max(m.equip, 0.7);
      m.action = kind;
      m.actionAge = 0;
      m.actionId = id;
      m.actionDuration =
        kind === "melee"
          ? id === "axe" || id === "pickaxe"
            ? 0.42
            : 0.6
          : kind === "consume"
            ? 1.0
            : kind === "throw"
            ? 0.58
            : 0.42;
    }
  };
  World.prototype.updateArms04 = function (dt, state) {
    const m = this.motion14;
    if (!m) return;
    dt = Math.min(0.1, Math.max(0, dt));
    m.time += dt;
    m.shotAge += dt;
    m.actionAge += dt;
    if (m.actionAge >= m.actionDuration) {
      if (m.action === "throw") m.equip = 0;
      m.action = null;
    }
    // Finish the open-hand release even when the last grenade has already left the belt.
    const id = ["throw","consume"].includes(m.action) ? m.actionId : state.selected,
      gun = isGun(id),
      profile = GUN_POSES14[id],
      reload = this.reloadState04?.progress ?? -1,
      w = this.viewWork14;
    if (m.selected !== id) {
      m.selected = id;
      m.equip =
        (m.lastShotId === id && m.shotAge < 0.12) ||
        (m.actionId === id && ["melee", "throw", "consume"].includes(m.action))
          ? 0.7
          : 0;
      if (m.lastShotId !== id) m.shotAge = 10;
      if (m.actionId !== id) m.action = null;
    }
    m.equip = Math.min(1, m.equip + dt / 0.28);
    m.swim = damp14(m.swim, state.swimming ? 1 : 0, 12, dt);
    const loc = this.locomotion14 || {},
      speed = Math.hypot(loc.vx || 0, loc.vz || 0),
      moving = loc.grounded && !state.boat ? clamp14(speed / 3.8) : 0;
    m.move = damp14(m.move, moving, 12, dt);
    m.sprint = damp14(m.sprint, state.sprinting ? 1 : 0, 14, dt);
    this.sprintBlend06 = m.sprint;
    m.crouch = damp14(m.crouch, state.crouched ? 1 : 0, 10, dt);
    m.air = damp14(
      m.air,
      loc.grounded === false && !state.boat && !state.swimming ? 1 : 0,
      10,
      dt,
    );
    const aim =
      gun &&
      state.aiming &&
      reload < 0 &&
      !state.sprinting &&
      !state.swimming &&
      m.equip > 0.65;
    m.aim = damp14(m.aim, aim ? 1 : 0, 15, dt);
    this.aimBlend08 = m.aim * smooth14(m.equip);
    m.phase += dt * (5.9 + m.sprint * 3.5) * m.move;
    const deltaYaw = Math.atan2(
        Math.sin(state.yaw - m.prevYaw),
        Math.cos(state.yaw - m.prevYaw),
      ),
      deltaPitch = state.pitch - m.prevPitch;
    m.prevYaw = state.yaw;
    m.prevPitch = state.pitch;
    spring14(
      m.swayX,
      clamp14(deltaYaw / Math.max(0.001, dt), -3, 3) * -0.014,
      19,
      dt,
    );
    spring14(
      m.swayY,
      clamp14(deltaPitch / Math.max(0.001, dt), -3, 3) * -0.011,
      19,
      dt,
    );
    const recoil = spring14(m.recoil, 0, 26, dt),
      push = spring14(m.push, 0, 30, dt),
      roll = spring14(m.roll, 0, 24, dt),
      land = spring14(m.landing, 0, 18, dt);
    const bob = 0.008 * m.move * (1 - m.aim * 0.9) * (1 - m.crouch * 0.55),
      breath = Math.sin(m.time * 1.35) * 0.0018 * (1 - m.aim * 0.82),
      draw = 1 - smooth14(m.equip);
    w.hip.set(
      0.22 * Math.min(1, Math.max(0.65, this.camera.aspect / 1.7)) +
        Math.sin(m.phase) * bob,
      -0.39 +
        Math.cos(m.phase * 2) * bob +
        breath -
        land -
        0.07 * m.sprint -
        0.04 * m.crouch +
        0.025 * m.air -
        draw * 0.57,
      -0.44 + push + 0.04 * m.sprint + 0.1 * draw,
    );
    const action = m.action ? clamp14(m.actionAge / m.actionDuration) : 0;
    let stroke = 0,
      toss = 0,
      reach = 0;
    if (m.action === "melee")
      stroke = track14(action, [
        [0, 0],
        [0.12, 1],
        [0.29, 0.8],
        [0.52, 0.22],
        [1, 0],
      ]);
    if (m.action === "throw")
      toss = track14(action, [
        [0, 0],
        [0.18, 1],
        [0.48, 0.72],
        [1, 0],
      ]);
    if (m.action === "reach") reach = Math.sin(action * Math.PI);
    stroke *= 1 - m.sprint;
    toss *= 1 - m.sprint;
    reach *= 1 - m.sprint;
    w.hip.x -= stroke * (id === "rock" ? 0.08 : 0.1);
    w.hip.y += stroke * 0.075 - reach * 0.04;
    w.hip.z -= stroke * 0.14 + toss * 0.12 + reach * 0.09;
    this.handRoot.rotation.set(
      recoil -
        (Math.PI / 6) * m.sprint -
        0.035 * m.air -
        0.6 * draw -
        stroke * 0.9 +
        toss * 0.3 +
        m.swayY.x * (1 - m.aim * 0.8),
      m.swayX.x * (1 - m.aim * 0.8) + stroke * 0.13,
      roll + Math.sin(m.phase) * bob * 0.4 + stroke * 0.32 - draw * 0.15,
    );
    const model = gun ? this.weaponViews[id] : null;
    let reloadPose = null,
      firePose = null;
    if (model) {
      resetMechanisms14(model);
      model.position.set(-0.025, 0.12, -0.12);
      model.rotation.set(0, 0, 0);
      if (reload >= 0) {
        reloadPose = reloadPose14(
          model,
          id,
          reload,
          this.reloadState04.needed || 1,
        );
        model.rotation.set(
          (GUNS29[id]?.tilt[0]??.30) * reloadPose.tilt,
          (GUNS29[id]?.tilt[1]??-.20) * reloadPose.tilt,
          (GUNS29[id]?.tilt[2]??-.55) * reloadPose.tilt,
        );
        model.position.y -= reloadPose.tilt * 0.065;
        model.position.x += Math.sin(reload*Math.PI)*.025;
        if (id === "rocketLauncher") model.position.z -= reloadPose.tilt * 0.22;
      }
      if (reload < 0) firePose = fireMechanism14(model, id, m.shotAge);
      model.updateMatrix();
      const optic = model.userData.optic08?.visible?model.userData.optic08:model.userData.ironAim25;
      if (optic) {
        w.optic.copy(optic.position);
        if (optic.parent !== model) {
          optic.parent.updateMatrix();
          w.optic.applyMatrix4(optic.parent.matrix);
        }
        w.optic
          .applyMatrix4(model.matrix)
          .applyQuaternion(this.handRoot.quaternion);
        w.ads.set(
          -w.optic.x,
          -w.optic.y,
          (profile.pistol ? -0.72 : id === "rocketLauncher" ? -0.82 : -0.68) -
            w.optic.z,
        );
        w.hip.lerp(w.ads, this.aimBlend08);
        w.hip.z += push * m.aim * 0.2;
      }
    }
    if(m.action==='consume'){const use=Math.sin(action*Math.PI);w.hip.x-=use*.16;w.hip.y+=use*.12;this.handRoot.rotation.z-=use*.14;}
    this.handRoot.position.copy(w.hip);
    const fov = 69 - (69-69/(this.aimZoom25||1.13)) * m.aim;
    if (Math.abs(this.camera.fov - fov) > 0.005) {
      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
    }
    selectVisible14(this, id, false);
    const right = this.rightHand04,
      left = this.leftHand04;
    right.visible = true;
    left.visible = true;
    let rightGrip = 0.7,
      leftGrip = 0.65,
      index = 0.65;
    if (gun) {
      w.right.copy(reloadPose?.right || profile.right);
      w.left.copy(reloadPose?.left || model.userData.supportGrip25 || profile.left);
      if (reload < 0) {
        if (firePose?.right) w.right.copy(firePose.right);
        if (firePose?.left) w.left.copy(firePose.left);
      }
      w.right.applyMatrix4(model.matrix);
      w.left.applyMatrix4(model.matrix);
      w.rightQ.copy(model.quaternion).multiply(profile.rightQ);
      w.leftQ
        .copy(model.quaternion)
        .multiply(reloadPose?.leftQ || profile.leftQ);
      rightGrip = reloadPose?.rightGrip ?? 0.97;
      leftGrip = reloadPose?.leftGrip ?? 0.92;
      index = reload >= 0 ? 0.12 : 0.4 + Math.exp(-m.shotAge * 32) * 0.42;
    } else {
      const p = TOOL_POSES14[id] || {
        right: new V(0.08, 0.04, 0.02),
        rightQ: RIGHT14,
        left: false,
        grip: 0.3,
      };
      w.right.copy(p.right);
      w.left.copy(p.left || new V(-0.18, -0.04, -0.12));
      w.rightQ.copy(p.rightQ || RIGHT14);
      w.leftQ.copy(p.leftQ || LEFT14);
      rightGrip = p.grip;
      leftGrip = p.leftGrip ?? p.grip;
      index = rightGrip;
      const tool = this.viewTools14[id],
        socket = this.toolSockets14[id];
      if (tool && socket) {
        tool.updateMatrix();
        w.right.copy(socket).applyMatrix4(tool.matrix);
        w.p.set(0.068, -0.01, 0.055).applyQuaternion(tool.quaternion);
        w.right.add(w.p);
        w.rightQ.copy(tool.quaternion).multiply(RIGHT14);
      }
      if(tool?.userData.rightGrip16){tool.updateMatrix();w.right.copy(tool.userData.rightGrip16).applyMatrix4(tool.matrix);w.rightQ.copy(tool.quaternion).multiply(RIGHT14);}
      if(tool?.userData.supportGrip16){w.left.copy(tool.userData.supportGrip16).applyMatrix4(tool.matrix);w.leftQ.copy(tool.quaternion).multiply(LEFT_SIDE14);leftGrip=.92;}
      left.visible = p.left !== false || !!tool?.userData.supportGrip16;
      if (m.action === "throw") {
        rightGrip *= 1 - smooth14(clamp14(action / 0.22));
        index = rightGrip;
        leftGrip *= 1 - toss * 0.7;
        const held = this.viewTools14[id];
        if (held && action > 0.1) held.visible = false;
      }
    }
    // Gameplay permits shooting/using items in water: keep every occupied grip visible.
    // Only free hands paddle; a two-handed gun or rock stays held while the legs propel the swimmer.
    if (m.swim > 0.001) {
      m.swimPhase += dt * (1.1 + 2.9 * clamp14(speed / 1.5));
      const t = m.swimPhase,
        held = gun || !!this.viewTools14[id];
      this.handRoot.position.y += m.swim * (0.04 + Math.cos(t * 2) * 0.005);
      this.handRoot.position.z -= m.swim * 0.02;
      this.handRoot.rotation.x += m.swim * 0.025;
      if (!held) {
        w.right.lerp(
          w.p.set(
            0.22 + Math.sin(t) * 0.06,
            -0.03 + Math.cos(t) * 0.045,
            -0.24 - Math.cos(t) * 0.15,
          ),
          m.swim,
        );
        w.rightQ.slerp(
          w.q.setFromEuler(new THREE.Euler(0.8, 0, -0.35)),
          m.swim,
        );
        rightGrip = THREE.MathUtils.lerp(rightGrip, 0.12, m.swim);
        index = THREE.MathUtils.lerp(index, 0.12, m.swim);
      }
      if (!left.visible || !held) {
        w.left.lerp(
          w.p.set(
            -0.22 - Math.sin(t + Math.PI) * 0.06,
            -0.03 + Math.cos(t + Math.PI) * 0.045,
            -0.24 - Math.cos(t + Math.PI) * 0.15,
          ),
          m.swim,
        );
        w.leftQ.slerp(w.q.setFromEuler(new THREE.Euler(0.8, 0, 0.35)), m.swim);
        if (m.swim > 0.15) left.visible = true;
        leftGrip = THREE.MathUtils.lerp(leftGrip, 0.12, m.swim);
      }
    }
    placeHand14(right, w.right, w.rightQ);
    placeHand14(left, w.left, w.leftQ);
    poseHand14(
      right,
      rightGrip,
      index,
      !gun && !this.viewTools14[id] ? 0.035 * m.swim : 0,
      dt,
    );
    poseHand14(
      left,
      leftGrip,
      leftGrip,
      leftGrip < 0.2 ? 0.035 * m.swim : 0,
      dt,
    );
    this.handRoot.updateWorldMatrix(true, true);
    updateEffects14(this, dt, id, m.shotAge);
    for (let i = 0; i < this.arms14.length; i++) {
      const hand = i === 0 ? right : left;
      this.arms14[i].root.visible = hand.visible;
      solveArm14(this.arms14[i], hand, this.camera);
    }
  };
  World.prototype.update = function (dt, state, playing, options) {
    update.call(this, dt, state, playing, options);
    if (!playing) for (const a of this.arms14 || []) a.root.visible = false;
  };
  World.prototype.prepareEntry11 = async function (state, progress, signal) {
    this.motion14 = makeMotion14(state);
    this.updateArms04(1 / 60, state);
    this.motion14.equip = 1;
    // Compile the additive flash and instanced-casing variants during entry, not the first shot.
    this.effects14.flashes.forEach((o) => (o.visible = true));
    this.effects14.mesh.visible = true;
    try {
      await prepare.call(this, state, progress, signal);
    } finally {
      this.effects14.flashes.forEach((o) => (o.visible = false));
      this.effects14.mesh.visible = false;
    }
  };
  World.prototype.dispose = function () {
    const skeletons = new Set();
    this.scene.traverse((o) => {
      if (o.skeleton) skeletons.add(o.skeleton);
    });
    skeletons.forEach((s) => s.dispose());
    dispose.call(this);
    this.motion14 = null;
    this.viewMaterials14 = null;
    this.effects14 = null;
  };
}
