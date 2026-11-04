import * as THREE from "three";
export const clamp14 = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const smooth14 = (t) => {
  t = clamp14(t);
  return t * t * t * (t * (t * 6 - 15) + 10);
};
export function track14(t, keys) {
  for (let i = 1; i < keys.length; i++)
    if (t <= keys[i][0]) {
      const a = keys[i - 1],
        b = keys[i];
      return THREE.MathUtils.lerp(
        a[1],
        b[1],
        smooth14((t - a[0]) / (b[0] - a[0])),
      );
    }
  return keys.at(-1)[1];
}
export function damp14(current, target, rate, dt) {
  return current + (target - current) * (1 - Math.exp(-rate * dt));
}
export function spring14(s, target, w, dt) {
  const e = s.x - target,
    k = s.v + w * e,
    a = Math.exp(-w * dt);
  s.x = target + (e + k * dt) * a;
  s.v = (s.v - w * k * dt) * a;
  return s.x;
}
const V = THREE.Vector3;
// Finger direction +Y and palm-facing +Z in hand space. These bases are right-handed.
export const RIGHT14 = new THREE.Quaternion().setFromRotationMatrix(
  new THREE.Matrix4().makeBasis(
    new V(0, 1, 0),
    new V(0, 0, -1),
    new V(-1, 0, 0),
  ),
);
export const LEFT14 = new THREE.Quaternion().setFromRotationMatrix(
  new THREE.Matrix4().makeBasis(new V(0, 0, 1), new V(1, 0, 0), new V(0, 1, 0)),
);
const q = (e) => new THREE.Quaternion().setFromEuler(new THREE.Euler(...e));
export const LEFT_SIDE14 = new THREE.Quaternion().setFromRotationMatrix(
  new THREE.Matrix4().makeBasis(
    new V(0, -1, 0),
    new V(0, 0, -1),
    new V(1, 0, 0),
  ),
);
export const LEFT_OVER14 = new THREE.Quaternion().setFromRotationMatrix(
  new THREE.Matrix4().makeBasis(
    new V(0, -1, 0),
    new V(0, 0, 1),
    new V(-1, 0, 0),
  ),
);
const profile = (right, left, reload, kick, extra = {}) => ({
  right: new V(...right),
  left: new V(...left),
  rightQ: RIGHT14.clone(),
  leftQ: LEFT14.clone(),
  reload,
  kick,
  ...extra,
});
export const GUN_POSES14 = {
  carbine26: profile([.07,-.035,.06],[-.052,.015,-.38],"magazine",.72),
  pdw26: profile([.065,-.035,.055],[-.052,.015,-.28],"magazine",.36),
  akRifle: profile([.07,-.035,.06],[-.055,.04,-.29],"magazine",.84),
  compactSmg: profile([.065,-.035,.055],[-.052,.04,-.25],"magazine",.35),
  rifle: profile(
    [0.07, -0.035, 0.06],
    [-0.055, 0.045, -0.23],
    "internal",
    0.75,
  ),
  boltRifle: profile(
    [0.07, -0.035, 0.06],
    [-0.055, 0.045, -0.25],
    "internal",
    1.15,
  ),
  semiRifle: profile(
    [0.07, -0.035, 0.06],
    [-0.05, 0.04, -0.23],
    "magazine",
    0.74,
  ),
  assaultRifle: profile(
    [0.07, -0.035, 0.06],
    [-0.05, 0.04, -0.24],
    "magazine",
    0.62,
  ),
  smg: profile(
    [0.065, -0.035, 0.055],
    [-0.055, 0.035, -0.16],
    "magazine",
    0.38,
  ),
  machineGun: profile(
    [0.075, -0.035, 0.055],
    [-0.065, 0.045, -0.29],
    "box",
    0.71,
  ),
  shotgun: profile([0.07, -0.035, 0.06], [-0.05, 0.025, -0.34], "shell", 1.25),
  combatShotgun: profile(
    [0.07, -0.035, 0.06],
    [-0.05, 0.025, -0.31],
    "magazine",
    1.12,
    { shellMagazine: true },
  ),
  pistol: profile(
    [0.061, -0.045, 0.048],
    [-0.035, -0.055, 0.075],
    "magazine",
    0.62,
    { pistol: true },
  ),
  heavyPistol: profile(
    [0.065, -0.045, 0.048],
    [-0.035, -0.055, 0.075],
    "magazine",
    1.0,
    { pistol: true },
  ),
  revolver: profile(
    [0.065, -0.045, 0.055],
    [-0.035, -0.055, 0.075],
    "cylinder",
    0.95,
    { pistol: true },
  ),
  rocketLauncher: profile(
    [0.09, -0.07, -0.005],
    [-0.075, 0.045, -0.43],
    "rocket",
    1.5,
  ),
};
export const TOOL_POSES14 = {
  syringe: {right:new V(.067,.075,.04),rightQ:RIGHT14,left:new V(-.12,.03,-.045),leftQ:LEFT14,grip:.72,leftGrip:.2},
  antiseptic: {right:new V(.085,.07,.04),rightQ:RIGHT14,left:new V(-.09,.07,.025),leftQ:LEFT14,grip:.72,leftGrip:.6},
  medkit: {right:new V(.17,.08,.065),rightQ:RIGHT14,left:new V(-.16,.07,.045),leftQ:LEFT14,grip:.55,leftGrip:.55},
  traumaKit: {right:new V(.19,.08,.075),rightQ:RIGHT14,left:new V(-.18,.07,.055),leftQ:LEFT14,grip:.55,leftGrip:.55},
  axe: {
    right: new V(0.056, 0.1, 0.025),
    rightQ: RIGHT14,
    grip: 0.95,
    left: false,
  },
  pickaxe: {
    right: new V(0.055, 0.09, 0.03),
    rightQ: RIGHT14,
    grip: 0.97,
    left: false,
  },
  hammer: {
    right: new V(0.052, 0.1, 0.03),
    rightQ: RIGHT14,
    grip: 0.94,
    left: false,
  },
  torch: {
    right: new V(0.055, 0.08, 0.025),
    rightQ: RIGHT14,
    grip: 0.87,
    left: false,
  },
  rock: {
    right: new V(0.17, 0.105, 0.04),
    left: new V(-0.15, 0.025, -0.06),
    rightQ: RIGHT14,
    leftQ: LEFT14,
    grip: 0.62,
    leftGrip: 0.58,
  },
  plan: {
    right: new V(0.14, 0.018, -0.06),
    left: new V(-0.34, 0.018, -0.06),
    rightQ: q([-0.3, Math.PI, -1.0]),
    leftQ: q([-0.3, Math.PI, 1.0]),
    grip: 0.28,
    leftGrip: 0.28,
  },
  satchel: {
    right: new V(0.14, 0.1, 0.05),
    left: new V(-0.16, 0.015, -0.035),
    rightQ: RIGHT14,
    leftQ: LEFT14,
    grip: 0.7,
    leftGrip: 0.67,
  },
  timedCharge: {
    right: new V(0.14, 0.1, 0.05),
    left: new V(-0.16, 0.035, -0.035),
    rightQ: RIGHT14,
    leftQ: LEFT14,
    grip: 0.7,
    leftGrip: 0.67,
  },
  f1Grenade: {
    right: new V(0.1, 0.1, 0.06),
    rightQ: RIGHT14,
    grip: 0.74,
    left: false,
  },
  beancan: {
    right: new V(0.125, 0.1, 0.04),
    rightQ: RIGHT14,
    grip: 0.74,
    left: false,
  },
};
export function makeMotion14(state) {
  return {
    selected: state?.selected || null,
    time: 0,
    phase: 0,
    move: 0,
    sprint: 0,
    aim: 0,
    crouch: 0,
    air: 0,
    swim: 0,
    swimPhase: 0,
    equip: 1,
    action: null,
    actionAge: 0,
    actionDuration: 0.5,
    shotAge: 10,
    shotCount: 0,
    prevYaw: state?.yaw || 0,
    prevPitch: state?.pitch || 0,
    swayX: { x: 0, v: 0 },
    swayY: { x: 0, v: 0 },
    recoil: { x: 0, v: 0 },
    push: { x: 0, v: 0 },
    roll: { x: 0, v: 0 },
    landing: { x: 0, v: 0 },
  };
}
