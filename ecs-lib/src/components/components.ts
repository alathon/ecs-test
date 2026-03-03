import * as BABYLON from "@babylonjs/core";

export const MAX_PLAYERS = 300;
export const MAX_ENTITIES = 10000;

// Re-useable vectors/rays used for movement.
// TODO: Could be not part of the sim world, passed in from outside instead?
export type Movement = {
  collisionProbe: BABYLON.Mesh[];
  uncollided: BABYLON.Vector3[];
  movementXZ: BABYLON.Vector3[];
  movementY: BABYLON.Vector3[];
  groundRay: BABYLON.Ray[];
};

// Not pre-creating these arrays due to groundRay/collisionProbe mostly. Although we could!
export const Movement: Movement = {
  collisionProbe: [],
  uncollided: [],
  movementXZ: [],
  movementY: [],
  groundRay: [],
};

export type MovementInput = {
  moveX: Float64Array;
  moveY: Float64Array;
  moveZ: Float64Array;
  jumping: Uint8Array;
};

export const MovementInput: MovementInput = {
  moveX: new Float64Array(MAX_PLAYERS),
  moveY: new Float64Array(MAX_PLAYERS),
  moveZ: new Float64Array(MAX_PLAYERS),
  jumping: new Uint8Array(MAX_PLAYERS),
};

export type Position = {
  x: Float64Array;
  y: Float64Array;
  z: Float64Array;
};

export const Position: Position = {
  x: new Float64Array(MAX_ENTITIES),
  y: new Float64Array(MAX_ENTITIES),
  z: new Float64Array(MAX_ENTITIES),
};

export type Velocity = {
  x: Float64Array;
  y: Float64Array;
  z: Float64Array;
};

export const Velocity: Velocity = {
  x: new Float64Array(MAX_ENTITIES),
  y: new Float64Array(MAX_ENTITIES),
  z: new Float64Array(MAX_ENTITIES),
};

export type Vitals = {
  health: number[];
  stamina: number[];
  mana: number[];
};

export const Vitals: Vitals = {
  health: Array(MAX_ENTITIES).fill(0),
  stamina: Array(MAX_ENTITIES).fill(0),
  mana: Array(MAX_ENTITIES).fill(0),
};

export const Stunned = {};

export type Time = {
  delta: number;
  deltaSeconds: number;
  then: number;
  tick: number;
};

export const Time: Time = {
  delta: 0,
  deltaSeconds: 0,
  then: Date.now(),
  tick: 0,
};

export type Babylon = {
  scene?: BABYLON.Scene;
};

export const Babylon: Babylon = {};
export const components = [
  Position,
  Velocity,
  Vitals,
  Stunned,
  Time,
  Babylon,
  MovementInput,
  Movement,
];
