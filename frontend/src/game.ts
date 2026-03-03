import { observe, onSet } from "bitecs";
import * as BABYLON from "@babylonjs/core";

import {
  MovementInputBuffer,
  Position,
  stepWorld,
  createPlayer,
  getWorld,
  type ECSWorld,
} from "ecs-lib";

import { DomInputManager } from "./dom-input-manager";

const TICK_MS = 1000 / 60;

class FakeMoveInputBuffer implements MovementInputBuffer {
  private playerMovement: {
    jumping: boolean;
    moveX: number;
    moveY: number;
    moveZ: number;
  } = {
    jumping: false,
    moveX: 0,
    moveY: 0,
    moveZ: 0,
  };

  bufferMovement(dim: DomInputManager) {
    const moveVector = dim.getMovementDirection();
    const jumping = dim.getJumping();
    this.playerMovement.jumping = jumping;
    this.playerMovement.moveX = moveVector.x;
    this.playerMovement.moveY = moveVector.y;
    this.playerMovement.moveZ = moveVector.z;
  }

  getInput(_tick: number, _eid: number) {
    return this.playerMovement;
  }
}

interface Entity {
  targetPosition: BABYLON.Vector3;
  mesh: BABYLON.Mesh;
}

export class Game {
  public currentTick = 0;
  public elapsedMs = 0;
  public playerId: number;
  public entities: Map<number, Entity> = new Map();
  public world: ECSWorld;
  public scene: BABYLON.Scene;
  public camera: BABYLON.Camera;
  public inputManager: DomInputManager;
  public moveInputBuffer: FakeMoveInputBuffer;

  constructor(scene: BABYLON.Scene, camera: BABYLON.Camera) {
    this.scene = scene;
    this.camera = camera;
    this.world = getWorld();
    this.moveInputBuffer = new FakeMoveInputBuffer();
    this.inputManager = new DomInputManager();
    this.inputManager.initialize(this.scene);
    this.world.externalDeps.babylon = { scene, camera };
    this.world.externalDeps.moveBuffer = this.moveInputBuffer;
    this.playerId = createPlayer(this.world);
    this.entities.set(this.playerId, {
      mesh: BABYLON.MeshBuilder.CreateCapsule(
        "player",
        { height: 2, radius: 0.5 },
        scene,
      ),
      targetPosition: new BABYLON.Vector3(0, 0, 0),
    });

    this.observeECSUpdates();
  }

  private observeECSUpdates() {
    observe(this.world, onSet(Position), (eid, params) => {
      this.entities.get(eid)?.targetPosition.set(params.x, params.y, params.z);
    });
  }

  public fixedTick(deltaTimeMs: number, now: number) {
    this.currentTick++;
    stepWorld(this.world, {
      tick: this.currentTick,
      deltaTimeMs: deltaTimeMs,
      now,
    });
  }

  public update(deltaTimeMs: number, now: number): number {
    this.elapsedMs += deltaTimeMs;

    // Check input
    this.moveInputBuffer.bufferMovement(this.inputManager);

    // Process ticks.
    let processedTicks = 0;
    while (this.elapsedMs >= TICK_MS) {
      this.elapsedMs -= TICK_MS;
      this.fixedTick(TICK_MS, now);
      processedTicks += 1;
    }

    // Lerp entities towards their target position.
    for (const entity of this.entities.values()) {
      const lerpFactor = deltaTimeMs / TICK_MS;
      if (
        entity.mesh.position.equalsWithEpsilon(entity.targetPosition, 0.001)
      ) {
        continue;
      }

      entity.mesh.position = BABYLON.Vector3.Lerp(
        entity.mesh.position,
        entity.targetPosition,
        lerpFactor,
      );
    }

    return processedTicks;
  }
}
