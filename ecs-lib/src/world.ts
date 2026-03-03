import { createWorld } from "bitecs";
import { Time } from "./components/components";
import { createDefaultPrefabs, type Prefabs } from "./prefabs";
import { createDefaultComponentObservers } from "./components/observers";
import * as BABYLON from "@babylonjs/core";
import { type MovementInputBuffer } from "./systems/movement";

const context: ECSWorld = {
  time: {
    delta: 0,
    deltaSeconds: 0,
    then: Date.now(),
    tick: 0,
  },
  prefabs: {
    Player: 0,
    NPC: 0,
    Mob: 0,
  },
  externalDeps: {},
};

export interface ECSWorld {
  time: Time;
  prefabs: Prefabs;
  externalDeps: {
    babylon?: { scene: BABYLON.Scene; camera: BABYLON.Camera };
    moveBuffer?: MovementInputBuffer;
  };
}

let _world: ECSWorld;

export const getWorld = () => {
  if (!_world) {
    _world = createWorld<ECSWorld>(context);
    createDefaultPrefabs(_world);
    createDefaultComponentObservers(_world);
  }

  return _world;
};
