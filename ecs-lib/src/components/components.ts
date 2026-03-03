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
  moveX: number[];
  moveY: number[];
  moveZ: number[];
  jumping: boolean[];
};

export const MovementInput: MovementInput = {
  moveX: Array(MAX_PLAYERS).fill(0),
  moveY: Array(MAX_PLAYERS).fill(0),
  moveZ: Array(MAX_PLAYERS).fill(0),
  jumping: Array(MAX_PLAYERS).fill(false),
};

export type Position = {
  x: number[];
  y: number[];
  z: number[];
};

export const Position: Position = {
  x: Array(MAX_ENTITIES).fill(0),
  y: Array(MAX_ENTITIES).fill(0),
  z: Array(MAX_ENTITIES).fill(0),
};

export type Velocity = {
  x: number[];
  y: number[];
  z: number[];
};

export const Velocity: Velocity = {
  x: Array(MAX_ENTITIES).fill(0),
  y: Array(MAX_ENTITIES).fill(0),
  z: Array(MAX_ENTITIES).fill(0),
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
