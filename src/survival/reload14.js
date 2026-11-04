import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import {
  track14,
  clamp14,
  smooth14,
  GUN_POSES14,
  LEFT_SIDE14,
  LEFT_OVER14,
} from "./pose14.js";
const V = THREE.Vector3,
  lerp = (a, b, t) => a.clone().lerp(b, smooth14(t));
function remember(o) {
  if (o) {
    o.userData.restPosition14 = o.position.clone();
    o.userData.restQuaternion14 = o.quaternion.clone();
  }
}
export function prepareReload14(model, id) {
  const p = GUN_POSES14[id],
    mat = new THREE.MeshStandardMaterial({
      color: 0x41494a,
      roughness: 0.56,
      metalness: 0.62,
    });
  if (p.reload === "magazine" && !model.userData.magazine) {
    const mag = new THREE.Mesh(
      new RoundedBoxGeometry(
        p.shellMagazine ? 0.075 : 0.055,
        p.shellMagazine ? 0.2 : 0.125,
        p.pistol ? 0.073 : p.shellMagazine ? 0.13 : 0.105,
        2,
        0.007,
      ),
      mat,
    );
    mag.position.set(0, p.pistol ? -0.14 : -0.09, p.pistol ? 0.035 : -0.12);
    model.add(mag);
    model.userData.magazine = mag;
  }
  if (p.reload === "box" && model.userData.feedBox14) {
    const old = model.userData.magazine;
    old?.parent?.remove(old);
    if (old) old.geometry.dispose();
    model.userData.magazine = model.userData.feedBox14;
  }
  const magazine = model.userData.magazine;
  if (magazine) {
    magazine.geometry.computeBoundingBox();
    const b = magazine.geometry.boundingBox;
    model.userData.magGrip14 = new V(
      b.min.x - 0.037,
      (b.min.y + b.max.y) / 2,
      (b.min.z + b.max.z) / 2 + 0.065,
    );
  }
  if (p.pistol && model.userData.slide14) {
    const slide = model.userData.slide14,
      optic = model.userData.optic08;
    if (optic) {
      optic.position.sub(slide.position);
      slide.add(optic);
    }
  }
  if (p.pistol && model.userData.bolt14)
    model.userData.bolt14.userData.hidden14 = true;
  const round = new THREE.Group(),
    brass = new THREE.MeshStandardMaterial({
      color: 0xa88a4a,
      metalness: 0.66,
      roughness: 0.42,
    }),
    tip = new THREE.MeshStandardMaterial({
      color: p.reload === "shell" ? 0x824a3c : 0x6c6556,
      roughness: 0.65,
    });
  const addRound = (x, y, z) => {
    const shell = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.009,
        0.009,
        p.reload === "shell" ? 0.052 : 0.057,
        12,
      ),
      brass,
    );
    shell.rotation.x = Math.PI / 2;
    shell.position.set(x, y, z);
    round.add(shell);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.009, 0.021, 12), tip);
    cap.rotation.x = -Math.PI / 2;
    cap.position.set(x, y, z - 0.039);
    round.add(cap);
  };
  if (p.reload === "cylinder")
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      addRound(Math.sin(a) * 0.05, Math.cos(a) * 0.05, 0);
    }
  else addRound(0, 0, 0);
  round.visible = false;
  model.add(round);
  model.userData.round14 = round;
  for (const key of [
    "magazine",
    "bolt14",
    "foregrip14",
    "cylinder14",
    "loadingRocket08",
    "breech08",
  ])
    remember(model.userData[key]);
  if (model.userData.scope14) model.userData.scope14.visible = false;
  model.traverse((o) => o.layers.set(1));
}
export function resetMechanisms14(model) {
  for (const key of [
    "magazine",
    "bolt14",
    "foregrip14",
    "cylinder14",
    "breech08",
  ]) {
    const o = model.userData[key];
    if (o?.userData.restPosition14) {
      o.position.copy(o.userData.restPosition14);
      o.quaternion.copy(o.userData.restQuaternion14);
      o.visible = !o.userData.hidden14;
    }
  }
  if (model.userData.slide14) {
    const o = model.userData.slide14;
    if (!o.userData.slideRest14) o.userData.slideRest14 = o.position.clone();
    o.position.copy(o.userData.slideRest14);
  }
  if (model.userData.round14) model.userData.round14.visible = false;
  if (model.userData.loadingRocket08)
    model.userData.loadingRocket08.visible = false;
}
/** Visual phases consume the actual gameplay reload clock; no ammunition is granted here. */
export function reloadPose14(model, id, progress, needed = 1) {
  const p = GUN_POSES14[id],
    r = clamp14(progress),
    u = model.userData,
    left = p.left.clone(),
    right = p.right.clone(),
    pose = {
      left,
      right,
      leftQ: p.leftQ.clone(),
      leftGrip: 0.72,
      rightGrip: 0.95,
      tilt: track14(r, [
        [0, 0],
        [0.15, 1],
        [0.72, 1],
        [0.96, 0],
        [1, 0],
      ]),
    };
  const socket = new V(),
    round = u.round14,
    mag = u.magazine,
    bolt = u.bolt14;
  if (p.reload === "magazine" || p.reload === "box") {
    const pull = track14(r, [
      [0, 0],
      [0.16, 0],
      [0.3, 1],
      [0.39, 1.8],
      [0.4, 1.8],
      [0.52, 0],
      [1, 0],
    ]);
    if (mag) {
      mag.position.y -= pull * 0.22;
      mag.position.z += pull * 0.05;
      mag.rotation.x += pull * 0.12;
      mag.visible = !(r > 0.345 && r < 0.4);
      socket
        .copy(u.magGrip14)
        .applyQuaternion(mag.quaternion)
        .add(mag.position);
    } else socket.set(-0.05, -0.18, -0.1);
    const reach = track14(r, [
      [0, 0],
      [0.15, 1],
      [0.58, 1],
      [0.73, 0],
      [1, 0],
    ]);
    left.lerp(socket, reach);
    pose.leftQ.slerp(
      mag ? mag.quaternion.clone().multiply(LEFT_SIDE14) : LEFT_SIDE14,
      reach,
    );
    if (r > 0.72 && r < 0.96) {
      const tug = track14(r, [
          [0.72, 0],
          [0.79, 1],
          [0.83, 0],
          [0.96, 0],
        ]),
        grasp = track14(r, [
          [0.72, 0],
          [0.77, 1],
          [0.85, 1],
          [0.96, 0],
        ]);
      if (p.pistol && u.slide14) u.slide14.position.z += tug * 0.035;
      else if (bolt) bolt.position.z += tug * 0.075;
      left.lerp(
        p.pistol
          ? new V(-0.075, 0.15, 0.075 + tug * 0.035)
          : new V(0.17, 0.075, -0.12 + tug * 0.075),
        grasp,
      );
      if (!p.pistol) left.y += grasp * (1 - grasp) * 1.4;
      pose.leftQ.slerp(p.pistol ? LEFT_SIDE14 : LEFT_OVER14, grasp);
    }
    pose.leftGrip =
      0.82 -
      0.47 *
        track14(r, [
          [0, 0],
          [0.31, 0],
          [0.37, 1],
          [0.43, 0],
          [1, 0],
        ]);
  } else if (p.reload === "cylinder") {
    const open = track14(r, [
        [0, 0],
        [0.16, 1],
        [0.72, 1],
        [0.83, 0],
        [1, 0],
      ]),
      cylinder = u.cylinder14;
    if (cylinder) {
      cylinder.position.x -= open * 0.13;
      cylinder.rotation.z -= open * 0.27;
      socket.copy(cylinder.position).add(new V(-0.025, -0.045, 0.09));
    } else socket.set(-0.13, 0.07, 0.03);
    const insert = track14(r, [
      [0, 0.17],
      [0.25, 0.17],
      [0.52, 0],
      [0.63, 0.13],
      [1, 0.13],
    ]);
    round.position.copy(socket).add(new V(0.025, 0.045, insert));
    round.visible = r > 0.27 && r < 0.59;
    left.lerp(
      socket.clone().add(new V(-0.035, -0.025, insert)),
      track14(r, [
        [0, 0],
        [0.17, 1],
        [0.7, 1],
        [0.95, 0],
        [1, 0],
      ]),
    );
    pose.leftGrip = 0.48;
    pose.leftQ.slerp(LEFT_SIDE14, open);
  } else if (p.reload === "shell" || p.reload === "internal") {
    const count = Math.max(1, Math.min(p.reload === "shell" ? 8 : 6, needed)),
      load = clamp14((r - 0.16) / 0.51) * count,
      cycle = load - Math.floor(load);
    const f = smooth14(cycle),
      port =
        p.reload === "shell"
          ? new V(-0.035, 0.015, -0.045)
          : new V(-0.035, 0.18, 0.035),
      from = port.clone().add(new V(-0.12, -0.14, 0.13));
    socket.copy(lerp(from, port, Math.sin(f * Math.PI)));
    round.position.copy(socket).add(new V(0.035, 0.04, -0.1));
    round.visible = r > 0.16 && r < 0.67;
    const feed = track14(r, [
      [0, 0],
      [0.16, 1],
      [0.67, 1],
      [0.74, 0],
      [1, 0],
    ]);
    left.lerp(socket, feed);
    pose.leftQ.slerp(LEFT_SIDE14, feed);
    pose.leftGrip = 0.48;
    if (p.reload === "internal" && bolt) {
      const open = track14(r, [
        [0, 0],
        [0.12, 1],
        [0.72, 1],
        [0.83, 0],
        [1, 0],
      ]);
      bolt.position.z += open * 0.09;
      bolt.rotation.z -= open * 0.65;
      const hand = track14(r, [
        [0, 0],
        [0.07, 1],
        [0.17, 1],
        [0.25, 0],
        [0.7, 0],
        [0.76, 1],
        [0.84, 1],
        [0.96, 0],
        [1, 0],
      ]);
      right.lerp(new V(0.15, 0.075, 0.02 + open * 0.09), hand);
      pose.rightGrip = 0.75;
    }
    if (p.reload === "shell" && u.foregrip14) {
      const pump = track14(r, [
        [0, 0],
        [0.71, 0],
        [0.78, 1],
        [0.83, 0],
        [1, 0],
      ]);
      u.foregrip14.position.z += pump * 0.11;
      left.lerp(
        p.left.clone().add(new V(0, 0, pump * 0.11)),
        track14(r, [
          [0, 0],
          [0.67, 0],
          [0.73, 1],
          [1, 1],
        ]),
      );
    }
  } else if (p.reload === "rocket") {
    const rocket = u.loadingRocket08,
      cap = u.breech08,
      open = track14(r, [
        [0, 0],
        [0.15, 1],
        [0.72, 1],
        [0.83, 0],
        [1, 0],
      ]),
      insert = track14(r, [
        [0, 0],
        [0.25, 0],
        [0.52, 1],
        [1, 1],
      ]);
    if (cap) cap.rotation.y += open * 1.25;
    if (rocket) {
      rocket.position.set(0, 0.14, 0.78 - insert * 0.93);
      rocket.visible = r > 0.22 && r < 0.68;
      socket.copy(rocket.position).add(new V(-0.065, -0.12, 0.06));
    }
    const hand = track14(r, [
      [0, 0],
      [0.25, 1],
      [0.6, 1],
      [0.92, 0],
      [1, 0],
    ]);
    left.lerp(socket, hand);
    pose.leftGrip = 0.72;
  }
  return pose;
}
export function fireMechanism14(model, id, age) {
  const u = model.userData,
    p = GUN_POSES14[id];
  if (u.slide14)
    u.slide14.position.z += Math.sin(clamp14(age / 0.095) * Math.PI) * 0.038;
  if (p.reload === "shell" && u.foregrip14) {
    const t = track14(age, [
      [0, 0],
      [0.13, 0],
      [0.27, 1],
      [0.42, 0],
      [5, 0],
    ]);
    u.foregrip14.position.z += t * 0.11;
    return { left: p.left.clone().add(new V(0, 0, t * 0.11)) };
  }
  if (p.reload === "internal" && u.bolt14) {
    const duration = id === "rifle" ? 0.34 : 0.75,
      t = track14(age, [
        [0, 0],
        [duration * 0.12, 0],
        [duration * 0.42, 1],
        [duration * 0.72, 1],
        [duration, 0],
        [5, 0],
      ]);
    u.bolt14.position.z += t * 0.09;
    u.bolt14.rotation.z -= t * 0.65;
    return {
      right: p.right.clone().lerp(new V(0.15, 0.075, 0.02 + t * 0.09), t),
    };
  }
  return null;
}
